import {
  getAllCustomerUpdates,
  getAllProposedChanges,
  saveCustomerUpdate,
  saveProposedChange,
  putOverlayEvidence,
  putOverlayInsight,
  putOverlayNextAction,
  putOverlayRisk,
} from './customerUpdateStore';
import { getAllInsightsForCustomer, getNextActionsForCustomer, getRisksForCustomer } from './customerRepository';
import { translateCheckIn } from '../lib/customerUpdate/checkInTranslation';
import type { CustomerUpdate, CustomerUpdateSource } from '../types/customerUpdate';
import type { CustomerCheckIn } from '../types/customerCheckIn';
import type {
  AnyProposedValue,
  ChangeReviewStatus,
  NewProposedCustomerChangeInput,
  ProposedCustomerChange,
  ProposedInsightValue,
  ProposedNextActionValue,
  ProposedRiskValue,
} from '../types/proposedCustomerChange';
import type { Evidence } from '../types/evidence';
import type { Insight } from '../types/insight';
import type { NextAction } from '../types/nextAction';
import type { Risk } from '../types/risk';

// The single business-logic entry point for the CustomerUpdate domain. This is
// the ONLY place that should construct or mutate CustomerUpdate/ProposedCustomerChange
// records, or write to the published overlay — so that a future automated source
// (Google Chat, email, an AI agent) can call the exact same functions a human's
// manual-entry UI calls today, with no special-case business logic anywhere.

function generateId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createCustomerUpdate(input: {
  customerId: string;
  source: CustomerUpdateSource;
  sourceDate: string;
  submittedBy: string;
  rawInput?: string;
}): CustomerUpdate {
  const update: CustomerUpdate = {
    id: generateId('update'),
    customerId: input.customerId,
    source: input.source,
    sourceDate: input.sourceDate,
    submittedBy: input.submittedBy,
    status: 'draft',
    rawInput: input.rawInput,
    createdAt: nowIso(),
  };
  saveCustomerUpdate(update);
  return update;
}

export function getCustomerUpdate(id: string): CustomerUpdate | undefined {
  return getAllCustomerUpdates().find((update) => update.id === id);
}

export function getCustomerUpdatesForCustomer(customerId: string): CustomerUpdate[] {
  return getAllCustomerUpdates()
    .filter((update) => update.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProposedChangesForCustomerUpdate(customerUpdateId: string): ProposedCustomerChange[] {
  return getAllProposedChanges().filter((change) => change.customerUpdateId === customerUpdateId);
}

// Authoring a change always produces reviewStatus 'pending' — review (accept/
// edit/reject) is a separate, later step, even in v0.1 where the same CSM does
// both. A mistakenly-added change is never deleted: reject it in review instead,
// so the record of what was proposed is never destroyed (product decision 12).
export function addProposedCustomerChange(input: NewProposedCustomerChangeInput): ProposedCustomerChange {
  const change = {
    ...input,
    id: generateId('change'),
    reviewStatus: 'pending',
  } as ProposedCustomerChange;
  saveProposedChange(change);

  // A draft CustomerUpdate moves into review once it has something to review.
  const update = getCustomerUpdate(input.customerUpdateId);
  if (update && update.status === 'draft') {
    saveCustomerUpdate({ ...update, status: 'in_review' });
  }

  return change;
}

// Persists the raw Step 2 check-in answers on the CustomerUpdate itself (see
// CustomerUpdate.checkIn), then deterministically translates them into
// ProposedCustomerChanges (lib/customerUpdate/checkInTranslation.ts) and
// authors each one — the CSM never constructs Evidence/Insight/Risk/NextAction
// objects directly for this primary flow.
//
// previousCheckInChangeIds lets the caller re-submit after going back to Step 2
// and changing an answer: any change from a prior submission that a human
// hasn't reviewed yet is superseded (rejected, never deleted — the rejected row
// stays as an audit record) rather than left to accumulate as a duplicate.
// Anything already accepted/edited/rejected by a human is left untouched.
export function submitCheckIn(
  customerUpdateId: string,
  customerId: string,
  checkIn: CustomerCheckIn,
  previousCheckInChangeIds: string[],
  reviewedBy: string,
): ProposedCustomerChange[] {
  const update = getCustomerUpdate(customerUpdateId);
  if (!update) return [];
  saveCustomerUpdate({ ...update, checkIn });

  for (const changeId of previousCheckInChangeIds) {
    const existing = getAllProposedChanges().find((change) => change.id === changeId);
    if (existing && existing.reviewStatus === 'pending') {
      reviewProposedCustomerChange(changeId, { reviewStatus: 'rejected', reviewedBy });
    }
  }

  const inputs = translateCheckIn(checkIn, { customerUpdateId, customerId, source: update.source, sourceDate: update.sourceDate });
  return inputs.map((input) => addProposedCustomerChange(input));
}

// reviewedValue is required when reviewStatus is 'edited' (the CSM's correction);
// for 'accepted'/'rejected' it's ignored — proposedValue is never touched either
// way, so what was originally proposed stays inspectable forever.
export function reviewProposedCustomerChange(
  changeId: string,
  review: { reviewStatus: Extract<ChangeReviewStatus, 'accepted' | 'edited' | 'rejected'>; reviewedValue?: AnyProposedValue; reviewedBy: string },
): ProposedCustomerChange {
  const change = getAllProposedChanges().find((item) => item.id === changeId);
  if (!change) throw new Error(`ProposedCustomerChange not found: ${changeId}`);

  const updated = {
    ...change,
    reviewStatus: review.reviewStatus,
    reviewedValue: review.reviewStatus === 'edited' ? review.reviewedValue : change.reviewedValue,
    reviewedBy: review.reviewedBy,
    reviewedAt: nowIso(),
  } as ProposedCustomerChange;

  saveProposedChange(updated);
  return updated;
}

export function discardCustomerUpdate(customerUpdateId: string): CustomerUpdate {
  const update = getCustomerUpdate(customerUpdateId);
  if (!update) throw new Error(`CustomerUpdate not found: ${customerUpdateId}`);
  const discarded: CustomerUpdate = { ...update, status: 'discarded' };
  saveCustomerUpdate(discarded);
  return discarded;
}

function pick<V>(reviewStatus: ChangeReviewStatus, proposedValue: V, reviewedValue: V | undefined): V {
  return reviewStatus === 'edited' && reviewedValue !== undefined ? reviewedValue : proposedValue;
}

function applyCreate(change: ProposedCustomerChange): void {
  const id = generateId(change.entityType);
  switch (change.entityType) {
    case 'evidence': {
      const value = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      const entity: Evidence = { ...value, id, customerId: change.customerId };
      putOverlayEvidence(entity);
      return;
    }
    case 'risk': {
      const value = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      const entity: Risk = {
        title: '',
        description: '',
        severity: 'medium',
        status: 'open',
        ...value,
        id,
        customerId: change.customerId,
      };
      putOverlayRisk(entity);
      return;
    }
    case 'insight': {
      const value = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      const entity: Insight = {
        section: 'why_score',
        statement: '',
        ...value,
        id,
        customerId: change.customerId,
      };
      putOverlayInsight(entity);
      return;
    }
    case 'next_action': {
      const value = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      const entity: NextAction = {
        scope: 'summary',
        headline: '',
        ...value,
        id,
        customerId: change.customerId,
      };
      putOverlayNextAction(entity);
      return;
    }
  }
}

function applyUpdate(change: ProposedCustomerChange): void {
  if (!change.targetEntityId) return;
  const targetId = change.targetEntityId;

  switch (change.entityType) {
    case 'evidence':
      // Evidence has no update semantics in v0.1 — it's an atomic historical
      // fact, never patched. The authoring UI never offers this combination.
      return;
    case 'risk': {
      const current = getRisksForCustomer(change.customerId).find((risk) => risk.id === targetId);
      if (!current) return;
      const value: ProposedRiskValue = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      putOverlayRisk({ ...current, ...value });
      return;
    }
    case 'insight': {
      const current = getAllInsightsForCustomer(change.customerId).find((insight) => insight.id === targetId);
      if (!current) return;
      const value: ProposedInsightValue = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      putOverlayInsight({ ...current, ...value });
      return;
    }
    case 'next_action': {
      const current = getNextActionsForCustomer(change.customerId).find((action) => action.id === targetId);
      if (!current) return;
      const value: ProposedNextActionValue = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
      putOverlayNextAction({ ...current, ...value });
      return;
    }
  }
}

function applyResolve(change: ProposedCustomerChange): void {
  if (change.entityType !== 'risk' || !change.targetEntityId) return;
  const current = getRisksForCustomer(change.customerId).find((risk) => risk.id === change.targetEntityId);
  if (!current) return;
  const value: ProposedRiskValue = pick(change.reviewStatus, change.proposedValue, change.reviewedValue);
  putOverlayRisk({ ...current, ...value, status: 'resolved' });
}

function applyProposedChange(change: ProposedCustomerChange): void {
  switch (change.operation) {
    case 'confirm':
    case 'no_change':
      // Deliberately a no-op against the canonical entity collections (product
      // decision 6/#4): the only lasting effect is this ProposedCustomerChange
      // audit row, plus any separately-authored 'create' evidence change in the
      // same CustomerUpdate.
      return;
    case 'create':
      applyCreate(change);
      return;
    case 'update':
      applyUpdate(change);
      return;
    case 'resolve':
      applyResolve(change);
      return;
  }
}

// Publishing NEVER imports healthEngine and NEVER touches src/data/healthSnapshots.ts
// or HealthOverride — entityType simply has no HealthSnapshot-shaped value in v0.1,
// so there is no code path that could set a HealthScore from a CustomerUpdate.
export function publishCustomerUpdate(customerUpdateId: string, publishedBy: string): CustomerUpdate {
  const update = getCustomerUpdate(customerUpdateId);
  if (!update) throw new Error(`CustomerUpdate not found: ${customerUpdateId}`);
  if (update.status === 'published') return update; // idempotent
  if (update.status === 'discarded') throw new Error('Cannot publish a discarded CustomerUpdate');

  const changes = getProposedChangesForCustomerUpdate(customerUpdateId);
  for (const change of changes) {
    if (change.reviewStatus !== 'accepted' && change.reviewStatus !== 'edited') continue;
    applyProposedChange(change);
  }

  const published: CustomerUpdate = { ...update, status: 'published', publishedAt: nowIso(), publishedBy };
  saveCustomerUpdate(published);
  return published;
}
