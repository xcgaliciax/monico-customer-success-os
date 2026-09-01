import type { HealthSnapshotInput } from '../types/healthSnapshot';

// Raw, unresolved snapshot inputs for the September 1, 2026 pilot portfolio report.
// calculatedScore/calculatedStatus/finalScore/finalStatus are deliberately absent —
// they are derived by healthEngine.resolveHealthSnapshot(), never hand-authored here.
// override is omitted for all four: no manual overrides exist in the v0.1 seed data.
export const healthSnapshotInputs: HealthSnapshotInput[] = [
  {
    id: 'siemens-2026-09-01',
    customerId: 'siemens',
    snapshotDate: '2026-09-01',
    dimensions: {
      valueProgress: 98,
      workflowAdoption: 95,
      championEngagement: 100,
      requiredRoleActivation: 90,
      executionRisk: 92,
    },
    trend: 'improving',
    confidence: 'high',
    lifecycle: 'verified_outcome',
    expansionReadiness: 'high',
    approved: true,
  },
  {
    id: 'grupo-balle-2026-09-01',
    customerId: 'grupo-balle',
    snapshotDate: '2026-09-01',
    dimensions: {
      valueProgress: 76,
      workflowAdoption: 74,
      championEngagement: 80,
      requiredRoleActivation: 85,
      executionRisk: 76,
    },
    trend: 'improving',
    confidence: 'high',
    lifecycle: 'adoption',
    // Expansion readiness is not assessed for Grupo Balle in PROJECT_CONTEXT.md — omitted
    // rather than guessed (field is optional for exactly this reason).
    approved: true,
  },
  {
    id: 'manprec-2026-09-01',
    customerId: 'manprec',
    snapshotDate: '2026-09-01',
    dimensions: {
      valueProgress: 85,
      workflowAdoption: 78,
      championEngagement: 95,
      requiredRoleActivation: 85,
      executionRisk: 68,
    },
    trend: 'improving',
    confidence: 'high',
    // PROJECT_CONTEXT.md states "Implementation -> Adoption" (transitional). Formal
    // licensing begins this same month but the transition isn't confirmed complete,
    // so the more conservative "implementation" stage is used — flagged as an assumption.
    lifecycle: 'implementation',
    approved: true,
  },
  {
    id: 'fibroptica-2026-09-01',
    customerId: 'fibroptica',
    snapshotDate: '2026-09-01',
    dimensions: {
      valueProgress: 82,
      workflowAdoption: 75,
      championEngagement: 85,
      requiredRoleActivation: 55,
      executionRisk: 78,
    },
    // PROJECT_CONTEXT.md states "Stable to Improving" — not a single canonical value.
    // The more conservative reading ("stable") is used — flagged as an assumption.
    trend: 'stable',
    confidence: 'medium',
    lifecycle: 'adoption',
    approved: true,
  },
];
