import { readCollection, writeCollection } from '../lib/localStorageStore';
import type { CustomerUpdate } from '../types/customerUpdate';
import type { ProposedCustomerChange } from '../types/proposedCustomerChange';
import type { Evidence } from '../types/evidence';
import type { Insight } from '../types/insight';
import type { NextAction } from '../types/nextAction';
import type { Risk } from '../types/risk';

// The CustomerUpdate domain's localStorage-backed persistence boundary. This is
// the only module that calls lib/localStorageStore directly for this domain —
// customerUpdateService (business logic) and customerRepository (overlay reads)
// both go through the functions here instead. Swapping this for an API/database
// later means rewriting only this file's bodies, not any caller.
//
// Two kinds of collections:
// - customerUpdates / proposedChanges: the append-and-amend audit log itself.
// - overlayEvidence / overlayRisks / overlayInsights / overlayNextActions: the
//   "published prototype overlay" — full entity records (new ones, or full
//   replacements for an existing seed entity's id) that customerRepository
//   merges on top of src/data/* at read time. See customerRepository.ts.
const COLLECTIONS = {
  customerUpdates: 'customer_updates',
  proposedChanges: 'proposed_changes',
  overlayEvidence: 'overlay_evidence',
  overlayRisks: 'overlay_risks',
  overlayInsights: 'overlay_insights',
  overlayNextActions: 'overlay_next_actions',
} as const;

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((existing) => existing.id === item.id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
}

export function getAllCustomerUpdates(): CustomerUpdate[] {
  return readCollection<CustomerUpdate>(COLLECTIONS.customerUpdates);
}

export function saveCustomerUpdate(update: CustomerUpdate): void {
  writeCollection(COLLECTIONS.customerUpdates, upsertById(getAllCustomerUpdates(), update));
}

export function getAllProposedChanges(): ProposedCustomerChange[] {
  return readCollection<ProposedCustomerChange>(COLLECTIONS.proposedChanges);
}

export function saveProposedChange(change: ProposedCustomerChange): void {
  writeCollection(COLLECTIONS.proposedChanges, upsertById(getAllProposedChanges(), change));
}

export function getOverlayEvidence(): Evidence[] {
  return readCollection<Evidence>(COLLECTIONS.overlayEvidence);
}

export function getOverlayRisks(): Risk[] {
  return readCollection<Risk>(COLLECTIONS.overlayRisks);
}

export function getOverlayInsights(): Insight[] {
  return readCollection<Insight>(COLLECTIONS.overlayInsights);
}

export function getOverlayNextActions(): NextAction[] {
  return readCollection<NextAction>(COLLECTIONS.overlayNextActions);
}

export function putOverlayEvidence(entity: Evidence): void {
  writeCollection(COLLECTIONS.overlayEvidence, upsertById(getOverlayEvidence(), entity));
}

export function putOverlayRisk(entity: Risk): void {
  writeCollection(COLLECTIONS.overlayRisks, upsertById(getOverlayRisks(), entity));
}

export function putOverlayInsight(entity: Insight): void {
  writeCollection(COLLECTIONS.overlayInsights, upsertById(getOverlayInsights(), entity));
}

export function putOverlayNextAction(entity: NextAction): void {
  writeCollection(COLLECTIONS.overlayNextActions, upsertById(getOverlayNextActions(), entity));
}
