import type {
  Confidence,
  DimensionContribution,
  ExpansionReadiness,
  HealthDimensions,
  HealthStatus,
  Lifecycle,
  Trend,
} from './health';

// A HealthOverride is an explicit human DECISION layer. It must never be
// auto-generated from a Risk or any other signal/evidence object.
export type HealthOverrideType = 'status_override' | 'score_cap' | 'manual_adjustment';

export interface HealthOverride {
  type: HealthOverrideType;
  finalScore?: number;
  finalStatus?: HealthStatus;
  reason: string; // required — an override must always be explainable
  sourceEvidenceIds?: string[];
}

// Raw, stored shape — everything a human/CS process asserts for a point in time.
// NO calculated fields belong here; those are derived by healthEngine.resolveHealthSnapshot.
export interface HealthSnapshotInput {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date
  dimensions: HealthDimensions; // the only "signals" input for v0.1
  trend: Trend;
  confidence: Confidence;
  lifecycle: Lifecycle;
  // Not stated for every v0.1 seed account in PROJECT_CONTEXT.md — optional so the
  // absence of an assessment isn't fabricated as data. See PROJECT_CONTEXT.md per account.
  expansionReadiness?: ExpansionReadiness;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  override?: HealthOverride;
  notes?: string;
}

// Resolved shape — returned by healthEngine.resolveHealthSnapshot(). This, not the
// input, is what services/pages/components consume.
export interface HealthSnapshot extends HealthSnapshotInput {
  calculatedScore: number; // Signals -> Score, engine-derived, never hand-authored
  calculatedStatus: HealthStatus; // band derived from calculatedScore
  finalScore: number; // Decision: override?.finalScore ?? calculatedScore
  finalStatus: HealthStatus; // Decision: override?.finalStatus ?? deriveHealthStatus(finalScore)
  contributions: DimensionContribution[];
}
