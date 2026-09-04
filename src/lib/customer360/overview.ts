import {
  getEvidenceForCustomer,
  getInsightsForCustomer,
  getLatestAdoptionSnapshot,
  getNextActionsForCustomer,
  getRisksForCustomer,
  getTimelineEventsForCustomer,
  getValueMetricsForCustomer,
} from '../../services/customerRepository';
import { buildCustomerHistoryView } from './history';
import type { TimelineDisplayItem } from '../../types/timelineEvent';
import { deriveAdoptionLevelLabel, deriveEvidenceProvenance, getCustomerHeaderViewModel, RISK_SEVERITY_RANK } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import { EXPANSION_READINESS_LABELS_ES, STATUS_LABELS_ES } from '../labels';
import { formatArrCompact } from '../formatters';
import type { AdoptionSnapshot } from '../../types/adoption';
import type { Customer } from '../../types/customer';
import type { DimensionContribution } from '../../types/health';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { Evidence } from '../../types/evidence';
import type { Insight } from '../../types/insight';
import type { NextAction } from '../../types/nextAction';
import type { Provenance } from '../../types/provenance';
import type { Risk } from '../../types/risk';
import type { ValueMetricEntry } from '../../types/valueMetric';

// buildCustomerOverview — the Resumen tab view-model. Generic across all four
// accounts: every field is derived from repository data, and any section without
// grounded data degrades to an honest omission rather than a fabricated one.

export interface AdoptionSummary {
  levelLabel: string;
  activeUsersLabel: string;
  workflowCoverageLabel?: string;
  independentOperationLabel?: string;
}

export interface CommercialSummary {
  arrLabel: string;
  renewalConfirmed: boolean;
  paymentWindowLabel?: string;
  expansionReadinessLabel?: string;
}

export interface QualitativeValueRow {
  evidence: Evidence;
  provenance: Provenance;
}

export type ValueDisplay =
  | { kind: 'quantified'; metrics: ValueMetricEntry[] }
  | { kind: 'qualitative'; evidence: QualitativeValueRow[] };

export interface CustomerOverview {
  header: CustomerHeaderViewModel;
  whyScoreInsights: Insight[];
  nextAction: NextAction | undefined;
  attentionRisk: Risk | undefined;
  dimensionContributions: DimensionContribution[];
  dimensionFooterNote: string;
  timelineEvents: TimelineDisplayItem[];
  valueDisplay: ValueDisplay;
  adoptionSummary: AdoptionSummary | undefined;
  commercialSummary: CommercialSummary | undefined;
}

function buildAdoptionSummary(
  customer: Customer,
  snapshot: HealthSnapshot | undefined,
  adoption: AdoptionSnapshot | undefined,
): AdoptionSummary | undefined {
  if (!snapshot) return undefined;
  const coverage = adoption?.workflowCoverage;
  const coveragePrefix = coverage ? (coverage.comparator === 'gt' ? '>' : coverage.comparator === 'gte' ? '≥' : '') : '';
  return {
    levelLabel: deriveAdoptionLevelLabel(snapshot.dimensions.workflowAdoption),
    activeUsersLabel:
      customer.users.active !== undefined
        ? `${customer.users.active} / ${customer.users.total} usuarios activos`
        : 'usuarios activos: dato no disponible',
    workflowCoverageLabel: coverage ? `${coveragePrefix}${coverage.estimatePct}% cobertura del flujo` : undefined,
    independentOperationLabel: adoption?.independentOperation
      ? adoption.independentOperation.status === 'confirmed'
        ? 'operación independiente'
        : 'operación en desarrollo'
      : undefined,
  };
}

function buildCommercialSummary(customer: Customer, snapshot: HealthSnapshot | undefined): CommercialSummary {
  return {
    arrLabel: formatArrCompact(customer.arrUsd),
    renewalConfirmed: customer.commercial.renewalConfirmed ?? false,
    paymentWindowLabel: customer.commercial.paymentWindowLabel,
    expansionReadinessLabel: snapshot?.expansionReadiness ? EXPANSION_READINESS_LABELS_ES[snapshot.expansionReadiness] : undefined,
  };
}

// Siemens has quantified executive anchors; every other account shows the
// strongest qualitative Value evidence instead — never a fabricated metric.
function buildValueDisplay(customerId: string): ValueDisplay {
  const metrics = getValueMetricsForCustomer(customerId);
  if (metrics.length > 0) return { kind: 'quantified', metrics: metrics.slice(0, 3) };

  const evidence = getEvidenceForCustomer(customerId)
    .filter((item) => item.relatedDimension === 'valueProgress' || item.category === 'value_realization')
    .filter((item) => item.impact !== 'negative')
    .slice(0, 3)
    .map((item) => ({ evidence: item, provenance: deriveEvidenceProvenance(item) }));
  return { kind: 'qualitative', evidence };
}

export function buildCustomerOverview(customerId: string): CustomerOverview | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header || !header.snapshot) return undefined;

  const whyScoreInsights = getInsightsForCustomer(customerId, 'why_score').slice(0, 3);
  const [nextAction] = getNextActionsForCustomer(customerId, 'summary');
  const attentionRisk = getRisksForCustomer(customerId)
    .filter((risk) => risk.status === 'open' || risk.status === 'monitoring')
    .sort((a, b) => RISK_SEVERITY_RANK[b.severity] - RISK_SEVERITY_RANK[a.severity])[0];
  const adoption = getLatestAdoptionSnapshot(customerId);

  // "Qué cambió" prefers curated, editorially-written narrative events (short,
  // Spanish, purpose-built for this compact slot) over the generic evidence-
  // derived history — the latter is a fallback for accounts with no curated
  // events, not a source to interleave with them.
  const curatedTimeline = getTimelineEventsForCustomer(customerId);
  const timelineEvents: TimelineDisplayItem[] =
    curatedTimeline.length > 0 ? curatedTimeline.slice(-3) : (buildCustomerHistoryView(customerId)?.entries ?? []).slice(-3);

  return {
    header,
    whyScoreInsights,
    nextAction,
    attentionRisk,
    dimensionContributions: header.snapshot.contributions,
    dimensionFooterNote: `Pesos congelados v0.1 · el estado ${STATUS_LABELS_ES[header.snapshot.finalStatus]} lo aprueba una persona`,
    timelineEvents,
    valueDisplay: buildValueDisplay(customerId),
    adoptionSummary: buildAdoptionSummary(header.customer, header.snapshot, adoption),
    commercialSummary: buildCommercialSummary(header.customer, header.snapshot),
  };
}
