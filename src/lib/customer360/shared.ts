import { getCustomerById, getLatestHealthSnapshot } from '../../services/customerRepository';
import type { Customer } from '../../types/customer';
import type { DimensionContribution } from '../../types/health';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { Evidence, EvidenceType } from '../../types/evidence';
import type { Milestone } from '../../types/milestone';
import type { NextAction } from '../../types/nextAction';
import type { Provenance } from '../../types/provenance';
import type { RiskSeverity } from '../../types/risk';

// Shared helpers for the Customer 360 view-model layer (lib/customer360/*). No
// scoring math happens here — that stays in healthEngine, reached only through the
// repository's already-resolved HealthSnapshot.

export interface CustomerHeaderViewModel {
  customer: Customer;
  snapshot: HealthSnapshot | undefined;
}

export function getCustomerHeaderViewModel(customerId: string): CustomerHeaderViewModel | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;
  return { customer, snapshot: getLatestHealthSnapshot(customerId) };
}

// Adoption-tab headline "level" is deliberately derived from the existing
// Workflow Adoption dimension score rather than a second, separately-authored
// judgment — there is exactly one source of truth for how well an account has
// adopted the product.
export function deriveAdoptionLevelLabel(workflowAdoptionScore: number): string {
  if (workflowAdoptionScore >= 85) return 'Alta';
  if (workflowAdoptionScore >= 65) return 'Media';
  return 'Baja';
}

// Evidence doesn't carry a provenance CLASS field (only confidence + verified) —
// this derives one from its type, per the canonical provenance semantics (spec
// §07 / sprint Phase G). A documented heuristic, not a schema change.
const EVIDENCE_TYPE_PROVENANCE: Record<EvidenceType, Provenance['class']> = {
  product_telemetry: 'measured',
  meeting_transcript: 'confirmed_by_cs',
  case_study: 'confirmed_by_client',
  customer_statement: 'confirmed_by_client',
  customer_success_observation: 'confirmed_by_cs',
  commercial_event: 'confirmed_by_cs',
  expansion_signal: 'confirmed_by_cs',
  blocker: 'confirmed_by_cs',
  dependency: 'confirmed_by_cs',
  product_feedback: 'confirmed_by_cs',
};

export function deriveEvidenceProvenance(evidence: Evidence): Provenance {
  return { class: EVIDENCE_TYPE_PROVENANCE[evidence.type], confidence: evidence.confidence };
}

// Milestone.title is Phase 1 canonical English (join key stability, not display
// copy). Every seeded Milestone has exactly one NextAction pointing at it with a
// Spanish headline written for display — prefer that; fall back to the raw title
// only for a milestone with no matching NextAction (shouldn't happen today, but
// safer than showing nothing).
export function resolveMilestoneLabel(milestone: Milestone, nextActions: NextAction[]): string {
  return nextActions.find((action) => action.relatedMilestoneId === milestone.id)?.headline ?? milestone.title;
}

export interface DimensionHighlights {
  helping: DimensionContribution[];
  limiting: DimensionContribution[];
}

// Purely computed from the already-resolved contributions — the highest-scoring
// dimension(s) are "helping", the single lowest-scoring is "limiting". No new
// judgment is introduced beyond what healthEngine already calculated.
export function pickDimensionHighlights(contributions: DimensionContribution[]): DimensionHighlights {
  if (contributions.length === 0) return { helping: [], limiting: [] };
  const maxScore = Math.max(...contributions.map((c) => c.score));
  const minScore = Math.min(...contributions.map((c) => c.score));
  return {
    helping: contributions.filter((c) => c.score === maxScore),
    limiting: contributions.filter((c) => c.score === minScore),
  };
}

export const RISK_SEVERITY_RANK: Record<RiskSeverity, number> = { high: 3, medium: 2, low: 1 };

// Days between an ISO date and an "as of" reference date — used for a risk's age.
// Returns undefined when the opened date isn't known, never a fabricated "0".
export function formatAgeLabel(openedAt: string | undefined, asOfIso: string): string | undefined {
  if (!openedAt) return undefined;
  const opened = new Date(`${openedAt}T00:00:00`);
  const asOf = new Date(`${asOfIso}T00:00:00`);
  const days = Math.round((asOf.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return undefined;
  return `abierto ${days} d`;
}
