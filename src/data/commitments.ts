import type { Commitment } from '../types/commitment';

// Intentionally empty for v0.1: PROJECT_CONTEXT.md does not specify a concrete,
// owned "recommended CS intervention" per account (only aspirational milestones,
// which are modeled separately in milestones.ts). Populating this with invented
// interventions would violate the "do not fabricate customer facts" constraint.
// The type and repository accessor exist so CS can start recording real
// commitments without a schema change. See the Phase 1 report for detail.
export const commitments: Commitment[] = [];
