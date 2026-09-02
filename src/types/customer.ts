// Stable account metadata only. Time-varying/judgment-based assessments live in
// HealthSnapshot; operational items live in Risk/Commitment/Milestone.
export type CommercialStatus = 'current' | 'upcoming' | 'pending' | 'overdue' | 'at_risk';

export interface CommercialInfo {
  status: CommercialStatus;
  nextInvoiceDate?: string; // ISO date — omit if not confirmed, do not approximate
  notes?: string;
  // Additive presentation fields for the Customer 360 Comercial summary — optional so
  // absence isn't fabricated as "no" or "unknown".
  renewalConfirmed?: boolean;
  paymentWindowLabel?: string; // short display form, e.g. "oct / nov 2026"
}

export interface Customer {
  id: string; // stable slug — join key for every other entity, never the display name
  name: string;
  // Additive presentation field for the Customer 360 header subtitle, e.g.
  // "Cuenta benchmark · México". Optional — omitted rather than invented per account.
  headerSubtitle?: string;
  arrUsd: number; // annual license value only; implementation revenue excluded
  billingCadence: 'annual' | 'monthly';
  customerSince: string; // ISO date
  champions: string[];
  users: {
    total: number;
    active?: number; // omitted where not reported
  };
  projects?: {
    total?: number;
    active?: number;
  };
  modulesUsed: string[];
  keyContextNotes: string[];
  commercial: CommercialInfo;
}
