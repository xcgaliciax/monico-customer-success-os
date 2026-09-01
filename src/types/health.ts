// Canonical HealthScore dimensions — Customer Success OS Chapter 04 v0.1.
// Do not add, rename, or reweight these without updating PROJECT_CONTEXT.md.
export type DimensionKey =
  | 'valueProgress'
  | 'workflowAdoption'
  | 'championEngagement'
  | 'requiredRoleActivation'
  | 'executionRisk';

// All dimensions are normalized 0-100 and positive-direction (higher is healthier).
// executionRisk: 100 = no material execution risk, 0 = critical execution risk.
export type HealthDimensions = Record<DimensionKey, number>;

export type HealthStatus = 'green' | 'yellow' | 'red';
export type Trend = 'improving' | 'stable' | 'deteriorating';
export type Confidence = 'high' | 'medium' | 'low';
export type ExpansionReadiness = 'low' | 'medium' | 'high';

// Value/adoption maturity only — deliberately excludes expansion readiness.
export type Lifecycle =
  | 'implementation'
  | 'first_value'
  | 'adoption'
  | 'independent_adoption'
  | 'verified_outcome';

export interface DimensionContribution {
  dimension: DimensionKey;
  score: number;
  weight: number;
  contribution: number;
}
