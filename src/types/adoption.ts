import type { Provenance } from './provenance';

// Canonical module identifiers — same vocabulary as Customer.modulesUsed, plus
// modules that can appear in the adoption table without being "in use" yet
// (Search: portfolio-wide low usage; Regulatory Documentation: not applicable yet).
export type ModuleKey =
  | 'Workspace'
  | 'Analysis'
  | 'Technical Analysis'
  | 'Clarification Meetings'
  | 'Reports'
  | 'Notes'
  | 'Tasks'
  | 'Search'
  | 'Regulatory Documentation'
  | 'Multivault';

// 'in_use': known to be used, but no frequency claim is supported by the source —
// the neutral state required when we cannot honestly say "recurring" or "selective".
export type ModuleUsageState = 'recurring' | 'selective' | 'in_use' | 'low' | 'no_evidence' | 'not_applicable';

export interface ModuleUsage {
  module: ModuleKey;
  state: ModuleUsageState;
  evidenceStatement: string;
  provenance: Provenance;
}

export type WorkflowDepthStepStatus = 'confirmed' | 'confirmed_frequent' | 'reported_no_telemetry';

export interface WorkflowDepthStep {
  order: number;
  label: string;
  status: WorkflowDepthStepStatus;
}

export type IndependentOperationStatus = 'confirmed' | 'developing';

// The adoption-domain snapshot. Deliberately does NOT re-store active/total user
// counts or historical project totals — those live once on Customer and are
// combined with the provenance tags here at the view-model layer, so there is
// exactly one source of truth for each number. Every field below beyond
// moduleUsage/perUserTelemetryAvailable is optional: an account only gets the
// headline metric it has real, grounded support for.
export interface AdoptionSnapshot {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date
  blockerSummary: string; // short qualitative attention note, e.g. "sin blocker material"
  activeUsersProvenance?: Provenance; // omitted when the active-user count itself is unknown
  workflowCoverage?: { estimatePct: number; comparator: 'gt' | 'gte' | 'eq'; provenance: Provenance };
  independentOperation?: { status: IndependentOperationStatus; provenance: Provenance };
  // Provenance for whichever project count the view-model picks (Customer.projects.total
  // when it reads as a historical baseline, else Customer.projects.active).
  projectsProvenance?: Provenance;
  moduleUsage: ModuleUsage[];
  workflowDepth?: WorkflowDepthStep[];
  perUserTelemetryAvailable: boolean;
}
