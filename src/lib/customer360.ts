import {
  getCustomerById,
  getHealthSnapshotsForCustomer,
  getInsightsForCustomer,
  getLatestAdoptionSnapshot,
  getLatestHealthSnapshot,
  getLatestPlatformTelemetry,
  getNextActionsForCustomer,
  getRisksForCustomer,
  getTimelineEventsForCustomer,
  getValueMetricsForCustomer,
} from '../services/customerRepository';
import { EXPANSION_READINESS_LABELS_ES } from './labels';
import { formatArrCompact } from './formatters';
import type { AdoptionSnapshot } from '../types/adoption';
import type { Customer } from '../types/customer';
import type { DimensionContribution } from '../types/health';
import type { HealthSnapshot } from '../types/healthSnapshot';
import type { Insight } from '../types/insight';
import type { NextAction } from '../types/nextAction';
import type { PlatformTelemetrySnapshot } from '../types/platformTelemetry';
import type { Risk } from '../types/risk';
import type { TimelineEvent } from '../types/timelineEvent';
import type { ValueMetricEntry } from '../types/valueMetric';

// View-model layer for the Customer 360 pages (pages -> repository/view-model ->
// presentational components). No component below this layer reads src/data or
// src/services directly, and no scoring math happens here — that is healthEngine's
// job, reached only through the repository's already-resolved HealthSnapshot.

export interface CustomerHeaderViewModel {
  customer: Customer;
  snapshot: HealthSnapshot | undefined;
}

export function getCustomerHeaderViewModel(customerId: string): CustomerHeaderViewModel | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;
  return { customer, snapshot: getLatestHealthSnapshot(customerId) };
}

function selectAttentionRisk(risks: Risk[]): Risk | undefined {
  return risks.find((risk) => risk.status === 'open' || risk.status === 'monitoring');
}

export interface CommercialSummary {
  arrLabel: string;
  renewalConfirmed: boolean;
  paymentWindowLabel?: string;
  expansionReadinessLabel?: string;
}

export interface AdoptionSummary {
  levelLabel: string;
  activeUsersLabel: string;
  workflowCoverageLabel: string;
  independentOperationLabel: string;
}

export interface ResumenViewModel {
  header: CustomerHeaderViewModel;
  whyScoreInsights: Insight[];
  nextAction: NextAction | undefined;
  attentionRisk: Risk | undefined;
  dimensionContributions: DimensionContribution[];
  dimensionFooterNote: string;
  timelineEvents: TimelineEvent[];
  valueMetrics: ValueMetricEntry[];
  adoptionSummary: AdoptionSummary | undefined;
  commercialSummary: CommercialSummary | undefined;
}

const LEVEL_LABEL_ES: Record<AdoptionSnapshot['assessment']['level'], string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

function buildAdoptionSummary(customer: Customer, adoption: AdoptionSnapshot | undefined): AdoptionSummary | undefined {
  if (!adoption || customer.users.active === undefined) return undefined;
  const coverage = adoption.workflowCoverage;
  const coveragePrefix = coverage.comparator === 'gt' ? '>' : coverage.comparator === 'gte' ? '≥' : '';
  return {
    levelLabel: LEVEL_LABEL_ES[adoption.assessment.level],
    activeUsersLabel: `${customer.users.active} / ${customer.users.total} usuarios activos`,
    workflowCoverageLabel: `${coveragePrefix}${coverage.estimatePct}% cobertura del flujo`,
    independentOperationLabel: 'operación independiente',
  };
}

function buildCommercialSummary(customer: Customer, snapshot: HealthSnapshot | undefined): CommercialSummary | undefined {
  return {
    arrLabel: formatArrCompact(customer.arrUsd),
    renewalConfirmed: customer.commercial.renewalConfirmed ?? false,
    paymentWindowLabel: customer.commercial.paymentWindowLabel,
    expansionReadinessLabel: snapshot?.expansionReadiness
      ? EXPANSION_READINESS_LABELS_ES[snapshot.expansionReadiness]
      : undefined,
  };
}

// Returns undefined when this customer has no curated Resumen narrative seeded yet
// (Phase 3A only seeds Siemens) — the page renders a plain, honest fallback rather
// than fabricating drivers, timeline events or value anchors for other accounts.
export function getResumenViewModel(customerId: string): ResumenViewModel | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header || !header.snapshot) return undefined;

  const whyScoreInsights = getInsightsForCustomer(customerId, 'why_score');
  const valueMetricEntries = getValueMetricsForCustomer(customerId);
  if (whyScoreInsights.length === 0 || valueMetricEntries.length === 0) return undefined;

  const [nextAction] = getNextActionsForCustomer(customerId, 'summary');
  const attentionRisk = selectAttentionRisk(getRisksForCustomer(customerId));
  const adoption = getLatestAdoptionSnapshot(customerId);

  return {
    header,
    whyScoreInsights,
    nextAction,
    attentionRisk,
    dimensionContributions: header.snapshot.contributions,
    dimensionFooterNote: 'Pesos congelados v0.1 · el estado Verde lo aprueba una persona',
    timelineEvents: getTimelineEventsForCustomer(customerId).slice(-3),
    valueMetrics: valueMetricEntries.slice(0, 3),
    adoptionSummary: buildAdoptionSummary(header.customer, adoption),
    commercialSummary: buildCommercialSummary(header.customer, header.snapshot),
  };
}

export interface AdopcionHeadlineMetric {
  value: string;
  label: string;
  provenanceClass: AdoptionSnapshot['activeUsersProvenance']['class'];
  confidence?: AdoptionSnapshot['activeUsersProvenance']['confidence'];
}

export interface AdopcionViewModel {
  header: CustomerHeaderViewModel;
  levelLabel: string;
  blockerSummary: string;
  headlineMetrics: AdopcionHeadlineMetric[];
  moduleUsage: AdoptionSnapshot['moduleUsage'];
  workflowDepth: AdoptionSnapshot['workflowDepth'];
  perUserTelemetryAvailable: boolean;
  usersTotal: number;
  usersActive: number | undefined;
  requiredRoleActivationScore: number | undefined;
  platformTelemetry: PlatformTelemetrySnapshot | undefined;
  hasSufficientHistory: boolean;
  adoptionInsights: Insight[];
  nextAction: NextAction | undefined;
}

// Returns undefined when no AdoptionSnapshot is seeded for this customer (Phase 3A
// only seeds Siemens).
export function getAdopcionViewModel(customerId: string): AdopcionViewModel | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  const adoption = getLatestAdoptionSnapshot(customerId);
  if (!header || !adoption) return undefined;

  const { customer, snapshot } = header;
  const coverage = adoption.workflowCoverage;
  const coveragePrefix = coverage.comparator === 'gt' ? '>' : coverage.comparator === 'gte' ? '≥' : '';

  const headlineMetrics: AdopcionHeadlineMetric[] = [
    {
      value: `${customer.users.active ?? 0} / ${customer.users.total}`,
      label: 'usuarios activos',
      provenanceClass: adoption.activeUsersProvenance.class,
      confidence: adoption.activeUsersProvenance.confidence,
    },
    {
      value: `${coveragePrefix}${coverage.estimatePct}%`,
      label: 'cobertura estimada del flujo',
      provenanceClass: coverage.provenance.class,
      confidence: coverage.provenance.confidence,
    },
    {
      value: 'Confirmada',
      label: 'independencia operativa',
      provenanceClass: adoption.independentOperationProvenance.class,
      confidence: adoption.independentOperationProvenance.confidence,
    },
    {
      value: String(customer.projects?.total ?? 0),
      label: 'proyectos cargados históricamente',
      provenanceClass: adoption.historicalProjectsProvenance.class,
      confidence: adoption.historicalProjectsProvenance.confidence,
    },
  ];

  return {
    header,
    levelLabel: LEVEL_LABEL_ES[adoption.assessment.level],
    blockerSummary: adoption.assessment.blockerSummary,
    headlineMetrics,
    moduleUsage: adoption.moduleUsage,
    workflowDepth: adoption.workflowDepth,
    perUserTelemetryAvailable: adoption.perUserTelemetryAvailable,
    usersTotal: customer.users.total,
    usersActive: customer.users.active,
    requiredRoleActivationScore: snapshot?.dimensions.requiredRoleActivation,
    platformTelemetry: getLatestPlatformTelemetry(customerId),
    hasSufficientHistory: getHealthSnapshotsForCustomer(customerId).length >= 2,
    adoptionInsights: getInsightsForCustomer(customerId, 'adoption'),
    nextAction: getNextActionsForCustomer(customerId, 'adoption')[0],
  };
}
