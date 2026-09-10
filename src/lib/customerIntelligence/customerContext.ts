import {
  getCommercialStatusSnapshotsForCustomer,
  getCommitmentsForCustomer,
  getCustomerById,
  getEvidenceForCustomer,
  getHealthSnapshotsForCustomer,
  getNextActionsForCustomer,
  getOperatingStageSnapshotsForCustomer,
  getProductMetricSnapshotsForCustomer,
  getRisksForCustomer,
  getWeeklyActionsForCustomer,
} from '../../services/customerRepository';
import {
  buildCommercialAttention,
  buildMissingInformation,
  buildRiskAttentionItems,
  canonicalizeProductMetricSnapshotsAsOf,
  selectLatestProductMetricSnapshotAsOf,
  type AttentionItem,
  type CommercialAttentionItem,
  type MissingInformationItem,
} from './customerIntelligenceSelectors';
import { latestAtOrBefore } from './preWeeklyScorecard';
import type { CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { Commitment } from '../../types/commitment';
import type { Customer } from '../../types/customer';
import type { Evidence } from '../../types/evidence';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { NextAction } from '../../types/nextAction';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { Risk } from '../../types/risk';
import type { WeeklyAction } from '../../types/weeklyAction';

export interface CustomerContextProductMetrics {
  latestSnapshot?: ProductMetricSnapshot;
  canonicalSnapshotsAsOf: ProductMetricSnapshot[];
  hasBaseline: boolean;
}

export interface CustomerContextCommercial {
  latestSnapshot?: CommercialStatusSnapshot;
  commercialAttention: CommercialAttentionItem[];
}

export type TemporalCoverage =
  | 'as_of'
  | 'partial_as_of'
  | 'current_state'
  | 'current_state_only'
  | 'derived_from_mixed_context';

export interface CustomerContextTemporalCoverage {
  customer: 'current_state';
  operatingStage: 'as_of';
  productMetrics: 'as_of';
  canonicalEvidence: 'partial_as_of';
  risks: 'current_state_only';
  riskAttention: 'current_state_only';
  commercial: 'as_of';
  commitments: 'current_state_only';
  nextActions: 'current_state_only';
  weeklyActions: 'as_of';
  health: 'as_of';
  missingInformation: 'derived_from_mixed_context';
}

export type TemporalLimitationField =
  | 'canonicalEvidence'
  | 'risks'
  | 'riskAttention'
  | 'commitments'
  | 'nextActions';

export interface TemporalLimitation {
  field: TemporalLimitationField;
  reason: string;
}

const TEMPORAL_COVERAGE: CustomerContextTemporalCoverage = {
  customer: 'current_state',
  operatingStage: 'as_of',
  productMetrics: 'as_of',
  canonicalEvidence: 'partial_as_of',
  risks: 'current_state_only',
  riskAttention: 'current_state_only',
  commercial: 'as_of',
  commitments: 'current_state_only',
  nextActions: 'current_state_only',
  weeklyActions: 'as_of',
  health: 'as_of',
  missingInformation: 'derived_from_mixed_context',
};

const TEMPORAL_LIMITATIONS: TemporalLimitation[] = [
  {
    field: 'canonicalEvidence',
    reason:
      'Evidence is currently canonical and filtered by sourceDate <= asOfDate, but canonical publication time is not attached to Evidence records.',
  },
  {
    field: 'risks',
    reason: 'Risk status history cannot be reconstructed reliably from the current model.',
  },
  {
    field: 'riskAttention',
    reason: 'Risk status history cannot be reconstructed reliably from the current model.',
  },
  {
    field: 'commitments',
    reason: 'Commitment creation/status history is not versioned.',
  },
  {
    field: 'nextActions',
    reason: 'NextAction has no historical/version timestamp.',
  },
];

export interface CustomerContext {
  customer: Customer;
  asOf: string;
  temporalCoverage: CustomerContextTemporalCoverage;
  temporalLimitations: TemporalLimitation[];
  operatingStage?: OperatingStage;
  productMetrics: CustomerContextProductMetrics;
  // Currently canonical Evidence, filtered by sourceDate <= asOf. This is
  // partial temporal coverage: overlay publication time is not attached to
  // Evidence records, so canonical availability at a past asOf is unknown.
  canonicalEvidence: Evidence[];
  // Current-state limitation: Risk has optional openedAt but no full version,
  // status-date, or resolvedAt history, so historical Risk state cannot be
  // reconstructed reliably yet. This returns the repository's current Risks.
  risks: Risk[];
  riskAttention: AttentionItem[];
  commercial: CustomerContextCommercial;
  // Current-state limitation: Commitment has dueDate but no created/effective
  // date or status history, so this returns the repository's current records.
  commitments: Commitment[];
  // Current-state limitation: NextAction has no date/version field, so this
  // returns the repository's current curated actions.
  nextActions: NextAction[];
  weeklyActions: WeeklyAction[];
  health?: HealthSnapshot;
  missingInformation: MissingInformationItem[];
}

function isOnOrBefore(date: string, asOf: string): boolean {
  return date <= asOf;
}

export function getCustomerContext(customerId: string, asOfDate: string): CustomerContext | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const operatingStageSnapshot = latestAtOrBefore(
    getOperatingStageSnapshotsForCustomer(customerId),
    asOfDate,
    (snapshot) => snapshot.asOfDate,
  );
  const operatingStage = operatingStageSnapshot?.stage;

  const rawMetricSnapshots = getProductMetricSnapshotsForCustomer(customerId);
  const canonicalMetricSnapshots = canonicalizeProductMetricSnapshotsAsOf(rawMetricSnapshots, asOfDate);
  const latestProductMetricSnapshot = selectLatestProductMetricSnapshotAsOf(rawMetricSnapshots, asOfDate);

  const canonicalEvidence = getEvidenceForCustomer(customerId).filter((item) => isOnOrBefore(item.sourceDate, asOfDate));

  const risks = getRisksForCustomer(customerId);
  const commitments = getCommitmentsForCustomer(customerId);
  const nextActions = getNextActionsForCustomer(customerId);

  const commercialStatusSnapshot = latestAtOrBefore(
    getCommercialStatusSnapshotsForCustomer(customerId),
    asOfDate,
    (snapshot) => snapshot.snapshotDate,
  );

  const weeklyActions = getWeeklyActionsForCustomer(customerId).filter((action) => isOnOrBefore(action.weekOf, asOfDate));

  const health = latestAtOrBefore(getHealthSnapshotsForCustomer(customerId), asOfDate, (snapshot) => snapshot.snapshotDate);

  return {
    customer,
    asOf: asOfDate,
    temporalCoverage: TEMPORAL_COVERAGE,
    temporalLimitations: TEMPORAL_LIMITATIONS,
    operatingStage,
    productMetrics: {
      latestSnapshot: latestProductMetricSnapshot,
      canonicalSnapshotsAsOf: canonicalMetricSnapshots,
      hasBaseline: Boolean(latestProductMetricSnapshot),
    },
    canonicalEvidence,
    risks,
    riskAttention: buildRiskAttentionItems(risks, canonicalEvidence, nextActions),
    commercial: {
      latestSnapshot: commercialStatusSnapshot,
      commercialAttention: buildCommercialAttention(customerId, commercialStatusSnapshot),
    },
    commitments,
    nextActions,
    weeklyActions,
    health,
    missingInformation: buildMissingInformation(customerId, asOfDate, {
      operatingStage,
      commercialStatusSnapshot,
      productMetricSnapshot: latestProductMetricSnapshot,
      healthSnapshot: health,
      includeHealthSnapshot: true,
      hasAnyMetricSnapshots: rawMetricSnapshots.length > 0,
    }),
  };
}
