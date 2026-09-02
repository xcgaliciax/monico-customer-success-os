import { getEvidenceForCustomer } from '../../services/customerRepository';
import { buildCustomerOverview, type CustomerOverview } from './overview';
import { buildCustomerRisksView, type CustomerRisksView } from './risks';
import { buildCustomerCommercialView, type CustomerCommercialView } from './commercial';

// buildCustomerReportView — the print/report route. Reuses the same view-models as
// the interactive tabs (same source of truth, per the sprint's explicit
// requirement) rather than recomputing anything.

export interface CustomerReportView {
  overview: CustomerOverview;
  risks: CustomerRisksView;
  commercial: CustomerCommercialView;
  evidenceCount: number;
}

export function buildCustomerReportView(customerId: string): CustomerReportView | undefined {
  const overview = buildCustomerOverview(customerId);
  const risks = buildCustomerRisksView(customerId);
  const commercial = buildCustomerCommercialView(customerId);
  if (!overview || !risks || !commercial) return undefined;

  return { overview, risks, commercial, evidenceCount: getEvidenceForCustomer(customerId).length };
}
