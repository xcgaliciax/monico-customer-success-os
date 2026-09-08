// Chapter 02 Daily Operating Stage — a NEW, independent operational concept.
// Distinct from the existing Lifecycle in types/health.ts, which models the
// separate Customer Value Lifecycle (strategic maturity). Do NOT merge, map,
// or migrate between OperatingStage and Lifecycle until a dedicated migration
// is deliberately planned — until then Lifecycle remains legacy/current-
// prototype behavior and this type does not touch it.
export type OperatingStage =
  | 'handoff'
  | 'ready'
  | 'proving'
  | 'first_value'
  | 'adopting'
  | 'operating';

// A point-in-time assertion of which Operating Stage a customer is in. Kept as
// its own historical entity (same reasoning as HealthSnapshotInput) rather than
// a field on Customer, since stage is time-varying and judgment-based, not
// stable account metadata.
export interface OperatingStageSnapshot {
  id: string;
  customerId: string;
  asOfDate: string; // ISO date
  stage: OperatingStage;
  // v0.1: only 'cs_manual' is populated — no system inference exists yet.
  source: 'cs_manual' | 'system_inferred';
  notes?: string;
}
