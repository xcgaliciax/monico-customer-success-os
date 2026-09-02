import type { Confidence } from './health';

// Data-provenance system — Customer Success OS UI/UX Spec v0.1 §07.
// Declares WHERE a displayed value came from, never how much we trust it in
// isolation from that source. A CS-captured baseline is CONFIRMADO POR CS,
// never MEDIDO, even when the figure is exact.
export type ProvenanceClass =
  | 'measured' // telemetry from the system of record, reproducible without human input
  | 'confirmed_by_client' // artifact produced or validated by the customer
  | 'confirmed_by_cs' // structured Customer Success observation, including hand-captured baselines
  | 'inferred' // derived by the system from other signals, not observed directly
  | 'unknown'; // no source — shown as a state, never as zero

export interface Provenance {
  class: ProvenanceClass;
  // Omit when the class already implies the confidence level, or when there is
  // nothing meaningful to add beyond the class itself (spec §07).
  confidence?: Confidence;
}
