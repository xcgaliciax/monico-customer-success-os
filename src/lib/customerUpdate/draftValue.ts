import type { Confidence } from '../../types/health';
import type { EvidenceType } from '../../types/evidence';
import type { InsightSection } from '../../types/insight';
import type { NextActionScope } from '../../types/nextAction';
import type { RiskSeverity, RiskStatus } from '../../types/risk';
import type {
  AnyProposedValue,
  ChangeOperation,
  ProposedEntityType,
  ProposedEvidenceValue,
  ProposedInsightValue,
  ProposedNextActionValue,
  ProposedRiskValue,
} from '../../types/proposedCustomerChange';

// A single flat, string/boolean-friendly form-state shape covering every field
// across all four v0.1 entity types — used by EntityValueFields for both
// authoring (Step 2, "create"/"update") and correcting (Step 3, "editar"), so
// the same component and the same draft<->value conversion is reused in both
// places instead of duplicating four field sets twice each.
export interface EntityDraftValue {
  // evidence
  statement: string;
  type: EvidenceType;
  category: string;
  source: string;
  sourceDate: string;
  confidence: Confidence;
  impact: 'positive' | 'negative' | 'neutral';
  verified: boolean;
  // risk
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  shortTitle: string;
  shortCause: string;
  owner: string;
  // insight
  section: InsightSection;
  context: string;
  // next_action
  scope: NextActionScope;
  headline: string;
  meta: string;
  relatedRiskId: string;
  relatedInsightId: string;
}

export function emptyDraftValue(defaults?: Partial<EntityDraftValue>): EntityDraftValue {
  return {
    statement: '',
    type: 'customer_success_observation',
    category: '',
    source: '',
    sourceDate: '',
    confidence: 'medium',
    impact: 'positive',
    verified: false,
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    shortTitle: '',
    shortCause: '',
    owner: '',
    section: 'why_score',
    context: '',
    scope: 'summary',
    headline: '',
    meta: '',
    relatedRiskId: '',
    relatedInsightId: '',
    ...defaults,
  };
}

// Pre-fills the shared draft shape from an existing canonical entity — used
// when the CSM picks a targetEntityId for an 'update' operation, so they edit
// in place against the entity's current values rather than starting blank.
export function draftFromExistingRisk(risk: {
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  shortTitle?: string;
  shortCause?: string;
  owner?: string;
}): EntityDraftValue {
  return emptyDraftValue({
    title: risk.title,
    description: risk.description,
    severity: risk.severity,
    status: risk.status,
    shortTitle: risk.shortTitle ?? '',
    shortCause: risk.shortCause ?? '',
    owner: risk.owner ?? '',
  });
}

export function draftFromExistingInsight(insight: { section: InsightSection; statement: string; context?: string }): EntityDraftValue {
  return emptyDraftValue({ section: insight.section, statement: insight.statement, context: insight.context ?? '' });
}

export function draftFromExistingNextAction(action: {
  scope: NextActionScope;
  headline: string;
  meta?: string;
  relatedRiskId?: string;
  relatedInsightId?: string;
}): EntityDraftValue {
  return emptyDraftValue({
    scope: action.scope,
    headline: action.headline,
    meta: action.meta ?? '',
    relatedRiskId: action.relatedRiskId ?? '',
    relatedInsightId: action.relatedInsightId ?? '',
  });
}

// Re-hydrates a draft from an already-authored proposedValue (partial) — used
// when opening "Editar" on a pending review card, so the correction starts from
// what was proposed rather than blank.
export function draftFromProposedValue(value: Record<string, unknown>): EntityDraftValue {
  return emptyDraftValue(value as Partial<EntityDraftValue>);
}

export function draftToEvidenceValue(draft: EntityDraftValue): ProposedEvidenceValue {
  return {
    statement: draft.statement,
    type: draft.type,
    category: draft.category,
    source: draft.source,
    sourceDate: draft.sourceDate,
    confidence: draft.confidence,
    impact: draft.impact,
    verified: draft.verified,
  };
}

export function draftToRiskValue(draft: EntityDraftValue): ProposedRiskValue {
  return {
    title: draft.title,
    description: draft.description,
    severity: draft.severity,
    status: draft.status,
    shortTitle: draft.shortTitle || undefined,
    shortCause: draft.shortCause || undefined,
    owner: draft.owner || undefined,
  };
}

export function draftToInsightValue(draft: EntityDraftValue): ProposedInsightValue {
  return {
    section: draft.section,
    statement: draft.statement,
    context: draft.context || undefined,
  };
}

export function draftToNextActionValue(draft: EntityDraftValue): ProposedNextActionValue {
  return {
    scope: draft.scope,
    headline: draft.headline,
    meta: draft.meta || undefined,
    relatedRiskId: draft.relatedRiskId || undefined,
    relatedInsightId: draft.relatedInsightId || undefined,
  };
}

// A closing note for a 'resolve' operation is pragmatically stored in the
// existing shortCause field rather than inventing a new one.
export function draftToResolveNote(draft: EntityDraftValue): ProposedRiskValue {
  return draft.shortCause ? { shortCause: draft.shortCause } : {};
}

// One conversion entry point shared by Step 2 (authoring) and Step 3 (editing a
// correction) so the entityType/operation branching exists in exactly one place.
// 'confirm'/'no_change' never carry a value payload — those operations are
// audit-only (see ChangeOperation) — so they always resolve to an empty object.
// Overloaded so a call site passing a literal entityType gets the exact matching
// value type back, with no cast needed.
export function valueFromDraft(entityType: 'evidence', operation: ChangeOperation, draft: EntityDraftValue): ProposedEvidenceValue;
export function valueFromDraft(entityType: 'risk', operation: ChangeOperation, draft: EntityDraftValue): ProposedRiskValue;
export function valueFromDraft(entityType: 'insight', operation: ChangeOperation, draft: EntityDraftValue): ProposedInsightValue;
export function valueFromDraft(entityType: 'next_action', operation: ChangeOperation, draft: EntityDraftValue): ProposedNextActionValue;
export function valueFromDraft(entityType: ProposedEntityType, operation: ChangeOperation, draft: EntityDraftValue): AnyProposedValue {
  if (operation === 'confirm' || operation === 'no_change') return {};
  if (entityType === 'evidence') return draftToEvidenceValue(draft);
  if (entityType === 'risk') return operation === 'resolve' ? draftToResolveNote(draft) : draftToRiskValue(draft);
  if (entityType === 'insight') return draftToInsightValue(draft);
  return draftToNextActionValue(draft);
}
