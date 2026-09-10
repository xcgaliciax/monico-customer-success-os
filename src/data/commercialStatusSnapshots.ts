import type { CommercialStatusSnapshot } from '../types/commercialStatusSnapshot';

// Weekly commercial-state assertions for the 2026-09-08 portfolio report.
// Grounded in the same facts already recorded on Customer.commercial (see
// data/customers.ts) — restructured into the new snapshot shape, not new
// judgment. ASCH is pre_contract: no payment/contract facts exist yet, so
// those fields are represented honestly rather than invented.
export const commercialStatusSnapshots: CommercialStatusSnapshot[] = [
  {
    id: 'commercial-siemens-2026-09-08',
    customerId: 'siemens',
    snapshotDate: '2026-09-08',
    paymentStatus: 'pending',
    contractStatus: 'renewed',
    commercialStatus: 'healthy',
    nextCommercialAction: 'Confirm exact October/November 2026 payment date.',
  },
  {
    id: 'commercial-grupo-balle-2026-09-08',
    customerId: 'grupo-balle',
    snapshotDate: '2026-09-08',
    paymentStatus: 'current',
    contractStatus: 'active',
    commercialStatus: 'healthy',
  },
  {
    id: 'commercial-manprec-2026-09-08',
    customerId: 'manprec',
    snapshotDate: '2026-09-08',
    paymentStatus: 'pending',
    contractStatus: 'active',
    commercialStatus: 'healthy',
    nextCommercialAction: 'Issue first license invoice (September 2026).',
  },
  {
    id: 'commercial-fibroptica-2026-09-08',
    customerId: 'fibroptica',
    snapshotDate: '2026-09-08',
    paymentStatus: 'current',
    contractStatus: 'active',
    commercialStatus: 'healthy',
    nextCommercialAction: 'Confirm decision on paying the remaining annual balance in full.',
  },
  {
    id: 'commercial-asch-2026-09-08',
    customerId: 'asch',
    snapshotDate: '2026-09-08',
    paymentStatus: 'not_applicable',
    contractStatus: 'not_signed',
    commercialStatus: 'pre_contract',
    nextCommercialAction: 'Complete construction vertical discovery and move to contract.',
  },
];
