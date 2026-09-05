import type { CustomerCheckIn } from './customerCheckIn';

// CustomerUpdate v0.1 — the audit envelope for a single "batch" of proposed
// changes to a customer's canonical record (spec: Customer Update architecture
// review). It never carries the changes themselves (see ProposedCustomerChange);
// it only records where the update came from, who submitted it, and its lifecycle.
//
// The source model is intentionally broader than what v0.1 can actually process —
// only 'manual_note' and 'call_transcript' are usable today (a human authors every
// ProposedCustomerChange by hand; there is no AI extraction yet). The remaining
// values exist so a future ingestion path (Google Chat, email, telemetry,
// automation, an AI agent) can create the exact same CustomerUpdate shape without
// a schema change or special-case business logic.
export type CustomerUpdateSource =
  | 'manual_note'
  | 'call_transcript'
  | 'uploaded_report'
  | 'google_chat'
  | 'email'
  | 'product_telemetry'
  | 'automated_workflow'
  | 'ai_agent';

// draft: being authored, not yet ready for review.
// in_review: at least one ProposedCustomerChange exists and is being accepted/
//   edited/rejected.
// published: accepted/edited changes have been applied to the prototype overlay.
//   Immutable from this point — a published CustomerUpdate is a permanent audit
//   record, never re-published or mutated.
// discarded: abandoned before publishing. Never deleted — kept for audit.
export type CustomerUpdateStatus = 'draft' | 'in_review' | 'published' | 'discarded';

export interface CustomerUpdate {
  id: string;
  customerId: string;
  source: CustomerUpdateSource;
  sourceDate: string; // ISO date — when the underlying event happened, not when captured
  submittedBy: string;
  status: CustomerUpdateStatus;
  // Pasted transcript / free-text source note. Audit-only: never rendered as a
  // canonical fact anywhere in Customer 360 or Customer Intelligence — only the
  // ProposedCustomerChanges a human authors from it become canonical data.
  rawInput?: string;
  createdAt: string; // ISO datetime
  publishedAt?: string;
  publishedBy?: string;
  // The structured Step 2 check-in answers, kept verbatim regardless of whether
  // they produced any ProposedCustomerChange — see types/customerCheckIn.ts.
  // Never consumed by Customer 360, Customer Intelligence, or HealthScore; it
  // exists only as part of this CustomerUpdate's own audit record.
  checkIn?: CustomerCheckIn;
}
