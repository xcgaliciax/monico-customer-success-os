import { getEvidenceForCustomer, getHealthSnapshotsForCustomer } from '../../services/customerRepository';
import { getCustomerHeaderViewModel, pickDimensionHighlights } from './shared';
import type { CustomerHeaderViewModel, DimensionHighlights } from './shared';
import type { DimensionKey } from '../../types/health';
import type { Evidence } from '../../types/evidence';
import type { HealthOverride } from '../../types/healthSnapshot';

// buildCustomerHealthView — the Salud tab view-model. Answers "why this score":
// the five dimensions with their weight/score/contribution, the top supporting
// evidence per dimension, and which dimensions are helping vs. limiting the score.

export interface DimensionEvidenceRow {
  dimension: DimensionKey;
  topEvidence: Evidence | undefined;
}

export interface CustomerHealthView {
  header: CustomerHeaderViewModel;
  dimensionEvidence: DimensionEvidenceRow[];
  highlights: DimensionHighlights;
  hasNumericTrendHistory: boolean;
  override: HealthOverride | undefined;
}

const DIMENSIONS: DimensionKey[] = ['valueProgress', 'workflowAdoption', 'championEngagement', 'requiredRoleActivation', 'executionRisk'];

// Prefers verified, higher-confidence evidence when a dimension has more than one
// linked item — never invents a citation when none exists.
function pickTopEvidence(candidates: Evidence[]): Evidence | undefined {
  return [...candidates].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    const rank = { high: 2, medium: 1, low: 0 } as const;
    return rank[b.confidence] - rank[a.confidence];
  })[0];
}

export function buildCustomerHealthView(customerId: string): CustomerHealthView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header || !header.snapshot) return undefined;

  const evidence = getEvidenceForCustomer(customerId);
  const dimensionEvidence: DimensionEvidenceRow[] = DIMENSIONS.map((dimension) => ({
    dimension,
    topEvidence: pickTopEvidence(evidence.filter((item) => item.relatedDimension === dimension)),
  }));

  return {
    header,
    dimensionEvidence,
    highlights: pickDimensionHighlights(header.snapshot.contributions),
    hasNumericTrendHistory: getHealthSnapshotsForCustomer(customerId).length >= 2,
    override: header.snapshot.override,
  };
}
