import type { DimensionContribution, DimensionKey, HealthDimensions, HealthStatus } from '../types/health';
import type { HealthSnapshot, HealthSnapshotInput } from '../types/healthSnapshot';

// Canonical weights — Customer Success OS Chapter 04 v0.1. Do not rename or reweight
// without updating PROJECT_CONTEXT.md's "HealthScore Framework v0.1" section.
export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  valueProgress: 0.3,
  workflowAdoption: 0.25,
  championEngagement: 0.15,
  requiredRoleActivation: 0.15,
  executionRisk: 0.15,
};

// Green: 80-100, Yellow: 60-79, Red: 0-59.
export const STATUS_BANDS = { green: 80, yellow: 60 } as const;

export function calculateDimensionContributions(dimensions: HealthDimensions): DimensionContribution[] {
  return (Object.keys(DIMENSION_WEIGHTS) as DimensionKey[]).map((dimension) => {
    const score = dimensions[dimension];
    const weight = DIMENSION_WEIGHTS[dimension];
    return { dimension, score, weight, contribution: score * weight };
  });
}

export function calculateHealthScore(dimensions: HealthDimensions): number {
  const total = calculateDimensionContributions(dimensions).reduce((sum, c) => sum + c.contribution, 0);
  return Math.round(total);
}

// Pure score -> band mapping. Overrides never live here — they live as data on
// HealthSnapshotInput.override and are applied in resolveHealthSnapshot.
export function deriveHealthStatus(score: number): HealthStatus {
  if (score >= STATUS_BANDS.green) return 'green';
  if (score >= STATUS_BANDS.yellow) return 'yellow';
  return 'red';
}

// The Signals -> Score -> Decision pipeline, as data:
//   dimensions          (signals)
//   calculatedScore/Status  (score, engine-derived)
//   finalScore/Status       (decision, human-approved — equals the calculated value
//                            unless an explicit HealthOverride is present)
export function resolveHealthSnapshot(input: HealthSnapshotInput): HealthSnapshot {
  const contributions = calculateDimensionContributions(input.dimensions);
  const calculatedScore = calculateHealthScore(input.dimensions);
  const calculatedStatus = deriveHealthStatus(calculatedScore);

  const finalScore = input.override?.finalScore ?? calculatedScore;
  const finalStatus = input.override?.finalStatus ?? deriveHealthStatus(finalScore);

  return {
    ...input,
    calculatedScore,
    calculatedStatus,
    finalScore,
    finalStatus,
    contributions,
  };
}
