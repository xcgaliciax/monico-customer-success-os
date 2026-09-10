// Time-varying commercial-state assertion, distinct from Customer.commercial
// (stable account metadata — see types/customer.ts CommercialInfo). This is a
// point-in-time snapshot, same reasoning as HealthSnapshotInput/OperatingStageSnapshot:
// commercial state changes week to week and is asserted by CS/Commercial, not derived.
//
// commercialStatus is a distinct controlled vocabulary from Customer.commercial.status
// (CommercialStatus) — the two must never be merged or read interchangeably.
// Deliberately named "Standing", never "Health" — commercial state, csHealth
// (HealthSnapshot) and platformHealth (ProductMetricSnapshot) are three
// separate concepts, and this domain must never borrow "Health" vocabulary.
// This file never references HealthSnapshot or ProductMetricSnapshot.
export type CommercialStanding = 'healthy' | 'attention' | 'critical' | 'pre_contract' | 'unknown';

export interface CommercialStatusSnapshot {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date

  // Free-text in v0.1 — no controlled taxonomy has been specified for these two
  // fields yet (unlike commercialStatus below). Do not infer an enum for them.
  paymentStatus: string;
  contractStatus: string;

  commercialStatus: CommercialStanding;
  commercialRisk?: string; // omitted rather than invented when no commercial risk is asserted
  nextCommercialAction?: string; // short free-text label — not a join to NextAction
}
