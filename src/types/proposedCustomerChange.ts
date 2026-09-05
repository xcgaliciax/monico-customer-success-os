import type { Evidence } from './evidence';
import type { Insight } from './insight';
import type { NextAction } from './nextAction';
import type { Risk } from './risk';

// The five operations a ProposedCustomerChange can request against the canonical
// record. Only 'create' may grow a collection; the other four always require an
// existing targetEntityId and never duplicate a record.
//
// - create: nothing in the canonical record represents this yet.
// - update: patches an existing entity's fields.
// - confirm: the CSM re-checked an existing Risk/Insight and it's still accurate.
//   Deliberately does NOT mutate the target entity (see product decision) — its
//   only lasting effect is this ProposedCustomerChange audit row, plus any
//   separately-authored supporting Evidence in the same CustomerUpdate.
// - resolve: closes an existing Risk (status -> 'resolved').
// - no_change: the source material mentioned this entity, but the canonical
//   record already reflects it accurately — proves it was checked, writes nothing.
export type ChangeOperation = 'create' | 'update' | 'confirm' | 'resolve' | 'no_change';

// v0.1 scope only — commitment, customer_context, and health_snapshot are
// deliberately excluded (see the Customer Update v0.1 architecture review).
export type ProposedEntityType = 'evidence' | 'insight' | 'risk' | 'next_action';

// pending: not yet reviewed.
// accepted: proposedValue publishes verbatim.
// edited: reviewedValue (the CSM's correction) publishes instead of proposedValue.
//   proposedValue is never overwritten or discarded — both are kept forever.
// rejected: nothing publishes. The row persists as an audit record of what was
//   proposed and rejected, and by/when.
export type ChangeReviewStatus = 'pending' | 'accepted' | 'edited' | 'rejected';

// Evidence is always a full new record — there is no "update" semantics for an
// atomic historical fact, so its proposed value is fully specified up front.
export type ProposedEvidenceValue = Omit<Evidence, 'id' | 'customerId'>;

// Risk/Insight/NextAction proposed values are partial: used for both 'create'
// (where the authoring UI enforces the fields that actually matter) and 'update'
// (a patch merged onto the existing entity — an omitted field means "unchanged").
export type ProposedRiskValue = Partial<Omit<Risk, 'id' | 'customerId'>>;
export type ProposedInsightValue = Partial<Omit<Insight, 'id' | 'customerId'>>;
export type ProposedNextActionValue = Partial<Omit<NextAction, 'id' | 'customerId'>>;

export type AnyProposedValue = ProposedEvidenceValue | ProposedInsightValue | ProposedRiskValue | ProposedNextActionValue;

interface ProposedCustomerChangeBase {
  id: string;
  customerUpdateId: string;
  customerId: string;
  operation: ChangeOperation;
  // Required in practice for update/confirm/resolve/no_change; absent for create.
  // Chosen by a human from the customer's existing entities — v0.1 has no fuzzy
  // matching or deduplication (see product decision 13); a future AI-assisted
  // path may suggest this value, but a human still confirms it.
  targetEntityId?: string;
  rationale?: string; // why this change is proposed — useful once AI can author changes too
  sourceEvidenceIds?: string[]; // existing published Evidence this change is grounded in
  reviewStatus: ChangeReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Discriminated union on entityType, chosen over a generic bag (publish-time code
// needs a compile-time guarantee that an 'evidence' change produces a valid
// Evidence) and over fully separate unrelated types (the review UI needs to
// iterate a single homogeneous ProposedCustomerChange[] regardless of entity type).
export type ProposedCustomerChange =
  | (ProposedCustomerChangeBase & {
      entityType: 'evidence';
      proposedValue: ProposedEvidenceValue;
      reviewedValue?: ProposedEvidenceValue;
    })
  | (ProposedCustomerChangeBase & {
      entityType: 'insight';
      proposedValue: ProposedInsightValue;
      reviewedValue?: ProposedInsightValue;
    })
  | (ProposedCustomerChangeBase & {
      entityType: 'risk';
      proposedValue: ProposedRiskValue;
      reviewedValue?: ProposedRiskValue;
    })
  | (ProposedCustomerChangeBase & {
      entityType: 'next_action';
      proposedValue: ProposedNextActionValue;
      reviewedValue?: ProposedNextActionValue;
    });

interface NewProposedChangeCommon {
  customerUpdateId: string;
  customerId: string;
  operation: ChangeOperation;
  targetEntityId?: string;
  rationale?: string;
  sourceEvidenceIds?: string[];
}

// Input shape for customerUpdateService.addProposedCustomerChange — the same
// fields as ProposedCustomerChange minus the ones the service assigns itself
// (id, reviewStatus, reviewedBy/reviewedAt/reviewedValue).
export type NewProposedCustomerChangeInput =
  | (NewProposedChangeCommon & { entityType: 'evidence'; proposedValue: ProposedEvidenceValue })
  | (NewProposedChangeCommon & { entityType: 'insight'; proposedValue: ProposedInsightValue })
  | (NewProposedChangeCommon & { entityType: 'risk'; proposedValue: ProposedRiskValue })
  | (NewProposedChangeCommon & { entityType: 'next_action'; proposedValue: ProposedNextActionValue });
