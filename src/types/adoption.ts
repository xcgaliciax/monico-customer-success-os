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
  | 'Regulatory Documentation';

export type ModuleUsageState = 'recurring' | 'selective' | 'low' | 'no_evidence' | 'not_applicable';

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

export interface AdoptionLevelAssessment {
  level: 'high' | 'medium' | 'low';
  blockerSummary: string; // e.g. "sin blocker material"
}

// The adoption-domain snapshot. Deliberately does NOT re-store active/total user
// counts or historical project totals — those live once on Customer and are
// combined with the provenance tags here at the view-model layer, so there is
// exactly one source of truth for each number.
export interface AdoptionSnapshot {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date
  assessment: AdoptionLevelAssessment;
  activeUsersProvenance: Provenance;
  workflowCoverage: { estimatePct: number; comparator: 'gt' | 'gte' | 'eq'; provenance: Provenance };
  independentOperationProvenance: Provenance;
  historicalProjectsProvenance: Provenance;
  moduleUsage: ModuleUsage[];
  workflowDepth: WorkflowDepthStep[];
  perUserTelemetryAvailable: boolean;
}
