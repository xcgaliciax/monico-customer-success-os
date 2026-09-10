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
  {
    id: 'commercial-siemens-2026-09-09',
    customerId: 'siemens',
    snapshotDate: '2026-09-09',
    paymentStatus: 'contrato renovado activo; ventana de pago no es Blocker actual',
    contractStatus: 'renovado/activo',
    commercialStatus: 'healthy',
    nextCommercialAction: 'Proteger seguimiento LAM y obtener siguiente paso explícito del proceso de aprobación.',
  },
  {
    id: 'commercial-grupo-balle-2026-09-09',
    customerId: 'grupo-balle',
    snapshotDate: '2026-09-09',
    paymentStatus: 'al corriente; factura del mes actual pendiente',
    contractStatus: 'activo',
    commercialStatus: 'healthy',
  },
  {
    id: 'commercial-manprec-2026-09-09',
    customerId: 'manprec',
    snapshotDate: '2026-09-09',
    paymentStatus: 'primer mes de licencia vencido; compromiso de pago pendiente',
    contractStatus: 'activo',
    commercialStatus: 'attention',
    commercialRisk: 'Sin respuesta a llamadas, correos o mensajes para solicitar fecha de pago / respuesta.',
    nextCommercialAction: 'Obtener compromiso explícito de pago / fecha.',
  },
  {
    id: 'commercial-fibroptica-2026-09-09',
    customerId: 'fibroptica',
    snapshotDate: '2026-09-09',
    paymentStatus: 'anualidad pagada confirmada hasta septiembre 2027',
    contractStatus: 'en revisión',
    commercialStatus: 'healthy',
    nextCommercialAction: 'Definir ruta de respuesta para contrato/NDA.',
  },
  {
    id: 'commercial-asch-2026-09-09',
    customerId: 'asch',
    snapshotDate: '2026-09-09',
    paymentStatus: 'no aplica; aún sin contrato',
    contractStatus: 'no firmado',
    commercialStatus: 'pre_contract',
    nextCommercialAction: 'Validar Construction Happy Path / First Value y avanzar hacia propuesta/contrato comercial.',
  },
];
