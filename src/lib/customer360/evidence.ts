import { getEvidenceForCustomer } from '../../services/customerRepository';
import { deriveEvidenceProvenance, getCustomerHeaderViewModel } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import type { Evidence } from '../../types/evidence';
import type { Provenance } from '../../types/provenance';

// buildCustomerEvidenceView — the Evidencia tab view-model. Answers "what sustains
// everything above" with the full structured Evidence registry for the account.
// Filtering (dimension/type/confidence) happens client-side in the page over this
// already-fetched list — no separate query surface needed for a v0.1 read-only MVP.

export interface EvidenceRow {
  evidence: Evidence;
  provenance: Provenance;
}

export interface CustomerEvidenceView {
  header: CustomerHeaderViewModel;
  rows: EvidenceRow[];
}

export function buildCustomerEvidenceView(customerId: string): CustomerEvidenceView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header) return undefined;

  const rows = getEvidenceForCustomer(customerId)
    .slice()
    .sort((a, b) => b.sourceDate.localeCompare(a.sourceDate))
    .map((evidence) => ({ evidence, provenance: deriveEvidenceProvenance(evidence) }));

  return { header, rows };
}
