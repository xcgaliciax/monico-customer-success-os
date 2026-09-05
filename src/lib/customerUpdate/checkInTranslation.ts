import type { CustomerCheckIn, CheckInTrend, RiskCheckIn } from '../../types/customerCheckIn';
import type { CustomerUpdateSource } from '../../types/customerUpdate';
import type { EvidenceType } from '../../types/evidence';
import type { DimensionKey } from '../../types/health';
import type { NewProposedCustomerChangeInput } from '../../types/proposedCustomerChange';
import { NEXT_STEP_LABELS } from './checkInConfig';

// Deterministic, conservative translation from the Step 2 check-in into
// ProposedCustomerChange inputs. This is the ONLY place that decides whether a
// check-in answer becomes a canonical proposal — the CSM never authors Evidence/
// Insight/Risk/NextAction objects directly for the primary flow.
//
// Rules (all intentional, matching the approved product decisions):
// - A level/trend selection alone NEVER creates an entity — it's a category
//   rating, not a customer-specific fact, so on its own it stays in
//   CustomerUpdate.checkIn only (see hasAnyCheckInContent below).
// - Valor/Adopción/Champion/Expansión only produce EVIDENCE (never an Insight)
//   when the CSM wrote an actual note — the note's text (verbatim) becomes the
//   Evidence statement. Evidence is the atomic factual layer; interpreting a
//   run of these into a curated Insight is deliberately left to a human using
//   Advanced Mode (or, later, to AI proposing that new Evidence updates an
//   existing Insight) — never auto-created here, so a recurring weekly
//   check-in never spawns a new Insight every time the same thing is restated.
// - Riesgo/blocker: a brand-new blocker (CSM says "Sí, es nuevo" + describes it)
//   proposes a Risk CREATE. An already-tracked blocker ("No, ya lo estamos
//   siguiendo" + picks one of the customer's own unresolved Risks) NEVER
//   creates a second Risk — "Sigue igual" confirms it, "Mejoró"/"Empeoró"
//   updates it (only the optional note, never fabricated wording), "Se
//   resolvió" resolves it.
// - Next Step always produces a NextAction when an option is chosen (it's a
//   CS-internal directive, not a claim about the customer) — except 'other',
//   which needs detail text since the option alone says nothing.
// - Every entity-creating proposal that isn't targeting an existing Risk is a
//   'create'; targeting an existing Risk always requires the CSM to have
//   explicitly picked it from their own unresolved Risks (never inferred/
//   fuzzy-matched) — see RiskCheckIn.existingRiskId.
interface TranslationContext {
  customerUpdateId: string;
  customerId: string;
  source: CustomerUpdateSource;
  sourceDate: string;
}

function impactFromTrend(trend: CheckInTrend | undefined): 'positive' | 'negative' | 'neutral' {
  if (trend === 'up') return 'positive';
  if (trend === 'down') return 'negative';
  return 'neutral';
}

// Evidence.type drives its provenance (see lib/customer360/shared.ts's
// EVIDENCE_TYPE_PROVENANCE): both options here resolve to 'confirmed_by_cs',
// never 'confirmed_by_client' — a Quick Check-in note is always the CSM's own
// account of what happened, even when the CustomerUpdate's source is a call
// transcript, unless something explicitly says otherwise (nothing in this
// flow does, so this never overclaims client confirmation).
function evidenceTypeForCheckIn(source: CustomerUpdateSource): EvidenceType {
  return source === 'call_transcript' ? 'meeting_transcript' : 'customer_success_observation';
}

function sourceLabelForCheckIn(source: CustomerUpdateSource): string {
  return source === 'call_transcript' ? 'Llamada con cliente (check-in)' : 'Nota de CS (check-in)';
}

function buildDimensionEvidence(
  category: string,
  relatedDimension: DimensionKey | undefined,
  note: string | undefined,
  trend: CheckInTrend | undefined,
  context: TranslationContext,
): NewProposedCustomerChangeInput | undefined {
  const trimmedNote = note?.trim();
  if (!trimmedNote) return undefined;

  return {
    customerUpdateId: context.customerUpdateId,
    customerId: context.customerId,
    operation: 'create',
    entityType: 'evidence',
    proposedValue: {
      statement: trimmedNote,
      type: evidenceTypeForCheckIn(context.source),
      category,
      source: sourceLabelForCheckIn(context.source),
      sourceDate: context.sourceDate,
      confidence: 'medium',
      verified: false,
      impact: impactFromTrend(trend),
      relatedDimension,
    },
  };
}

function translateRiskCheckIn(risk: RiskCheckIn | undefined, context: TranslationContext): NewProposedCustomerChangeInput | undefined {
  if (!risk?.hasBlocker) return undefined;

  if (risk.isNewBlocker) {
    const blockerText = risk.blockerDescription?.trim();
    if (!blockerText) return undefined;
    return {
      customerUpdateId: context.customerUpdateId,
      customerId: context.customerId,
      operation: 'create',
      entityType: 'risk',
      proposedValue: {
        title: blockerText.length > 60 ? `${blockerText.slice(0, 60)}…` : blockerText,
        description: blockerText,
        severity: risk.level ?? 'medium',
        status: 'open',
        shortCause: blockerText,
      },
    };
  }

  // An already-tracked blocker — never creates a second Risk. The CSM must
  // have explicitly picked one of their own unresolved Risks.
  if (!risk.existingRiskId || !risk.changeStatus) return undefined;
  const changeNote = risk.changeNote?.trim();

  if (risk.changeStatus === 'same') {
    return {
      customerUpdateId: context.customerUpdateId,
      customerId: context.customerId,
      operation: 'confirm',
      entityType: 'risk',
      targetEntityId: risk.existingRiskId,
      rationale: changeNote || 'El CSM confirmó que este blocker sigue vigente en el check-in.',
      proposedValue: {},
    };
  }

  if (risk.changeStatus === 'resolved') {
    return {
      customerUpdateId: context.customerUpdateId,
      customerId: context.customerId,
      operation: 'resolve',
      entityType: 'risk',
      targetEntityId: risk.existingRiskId,
      rationale: changeNote || 'El CSM marcó este blocker como resuelto en el check-in.',
      proposedValue: changeNote ? { shortCause: changeNote } : {},
    };
  }

  // 'improved' | 'worsened' — a canonical UPDATE must represent an actual
  // mutation. Without a note there is no field to change, so this is NOT
  // proposed at all: the categorical selection stays in CustomerUpdate.checkIn
  // only (never an empty Risk UPDATE, never a rationale-only proposal).
  if (!changeNote) return undefined;

  return {
    customerUpdateId: context.customerUpdateId,
    customerId: context.customerId,
    operation: 'update',
    entityType: 'risk',
    targetEntityId: risk.existingRiskId,
    rationale: changeNote,
    proposedValue: { shortCause: changeNote },
  };
}

export function translateCheckIn(checkIn: CustomerCheckIn, context: TranslationContext): NewProposedCustomerChangeInput[] {
  const changes: NewProposedCustomerChangeInput[] = [];

  const valueChange = buildDimensionEvidence('value_realization', 'valueProgress', checkIn.value?.note, checkIn.value?.trend, context);
  if (valueChange) changes.push(valueChange);

  const adoptionChange = buildDimensionEvidence('workflow_adoption', 'workflowAdoption', checkIn.adoption?.note, checkIn.adoption?.trend, context);
  if (adoptionChange) changes.push(adoptionChange);

  const championChange = buildDimensionEvidence('champion_engagement', 'championEngagement', checkIn.champion?.note, checkIn.champion?.trend, context);
  if (championChange) changes.push(championChange);

  // Expansion has no matching HealthScore dimension (see types/health.ts) —
  // existing expansion Evidence in the seed data (e.g. ev-siemens-expansion)
  // has no relatedDimension either, so this follows the same precedent.
  const expansionChange = buildDimensionEvidence('expansion', undefined, checkIn.expansion?.note, checkIn.expansion?.trend, context);
  if (expansionChange) changes.push(expansionChange);

  const riskChange = translateRiskCheckIn(checkIn.risk, context);
  if (riskChange) changes.push(riskChange);

  const nextStep = checkIn.nextStep;
  if (nextStep?.option && (nextStep.option !== 'other' || nextStep.detail?.trim())) {
    changes.push({
      customerUpdateId: context.customerUpdateId,
      customerId: context.customerId,
      operation: 'create',
      entityType: 'next_action',
      proposedValue: {
        scope: nextStep.option === 'resolve_blocker' ? 'risk' : nextStep.option === 'confirm_expansion' ? 'opportunity' : 'summary',
        headline: NEXT_STEP_LABELS[nextStep.option],
        meta: nextStep.detail?.trim() || undefined,
      },
    });
  }

  return changes;
}
// A light "you haven't answered anything yet" hint for the UI — never a block.
export function hasAnyCheckInContent(checkIn: CustomerCheckIn): boolean {
  return Boolean(
    checkIn.value?.level ||
      checkIn.value?.trend ||
      checkIn.value?.note?.trim() ||
      checkIn.adoption?.level ||
      checkIn.adoption?.trend ||
      checkIn.adoption?.note?.trim() ||
      checkIn.champion?.level ||
      checkIn.champion?.trend ||
      checkIn.champion?.note?.trim() ||
      checkIn.risk?.level ||
      checkIn.risk?.hasBlocker ||
      checkIn.expansion?.level ||
      checkIn.expansion?.trend ||
      checkIn.expansion?.note?.trim() ||
      checkIn.nextStep?.option,
  );
}
