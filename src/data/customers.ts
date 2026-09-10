import type { Customer } from '../types/customer';

// Stable account metadata for the four v0.1 pilot accounts, transcribed from
// PROJECT_CONTEXT.md. Fields not supported by that document are omitted rather
// than approximated (see Phase 1 report for the full list of such omissions).
export const customers: Customer[] = [
  {
    id: 'siemens',
    name: 'Siemens',
    headerSubtitle: 'Cuenta benchmark · México',
    arrUsd: 24000,
    billingCadence: 'annual',
    customerSince: '2025-01-01',
    champions: ['Ariadne', 'Alexis'],
    users: { total: 25, active: 15 },
    projects: { total: 71 },
    modulesUsed: [
      'Workspace',
      'Analysis',
      'Technical Analysis',
      'Clarification Meetings',
      'Reports',
      'Notes',
      'Tasks',
    ],
    keyContextNotes: [
      'Renewed for a second year during 2026.',
      'Regional rollout being prepared for 10 countries in LAM/LATAM; possible future global rollout.',
      'Según la actualización CS/management del 9 sep, Siemens Germany mostró interés y la propuesta regional LAM sigue pendiente de aprobación final regional/CFO.',
      'Search / conectores de procurement están emergiendo como oportunidad de descubrimiento.',
      'Aproximadamente 90% de ciertos análisis técnicos pueden involucrar más de 40 documentos.',
      'Champions Ariadne and Alexis, with CFO support and the Head of LAM/Brazil involved.',
      'Operates independently on real tender workflows.',
      'Estimated >90% coverage of relevant tenders, although not every tender uses every workflow.',
      "Case study documents up to 50% operational time reduction, across 180-250 tenders per year handled by a six-person team.",
      'Strong internal advocacy — customer has presented monico internally and globally.',
      'Recent product requests are tied to actual operational decision-making.',
    ],
    commercial: {
      status: 'upcoming',
      notes: '2026 annual license USD 24k. Payment expected Oct/Nov 2026; exact date pending confirmation.',
      renewalConfirmed: true, // "Renewed for a second year during 2026." — key context note above
      paymentWindowLabel: 'oct / nov 2026',
    },
  },
  {
    id: 'grupo-balle',
    name: 'Grupo Balle',
    arrUsd: 15204,
    billingCadence: 'monthly',
    customerSince: '2026-04-01',
    champions: ['Edy'],
    users: { total: 7, active: 6 },
    projects: { total: 19, active: 12 },
    modulesUsed: ['Workspace', 'Analysis', 'Reports', 'Clarification Meetings'],
    keyContextNotes: [
      'Kickoff recorded April 2026; effective implementation primarily occurred in May after delays.',
      'First effective license month was July 2026 — September 2026 begins month 3.',
      'María is currently a highly active user; Jair is also relevant.',
      'CS reports 16 total projects; Command Center showed 12 active projects at snapshot.',
      'Output generation has increased significantly in recent weeks; adoption trajectory is improving.',
      'Multivault capability is only now being activated.',
      'La reunión semanal del 9 sep fue positiva; los reportes de monico ayudaron materialmente al cliente, incluyendo el uso de output por María para investigación de normas / ISO y un reporte interno.',
      'Fuerte interés en Search; el segundo vault está pendiente de definir entidad legal / razón social.',
    ],
    commercial: {
      status: 'current',
      notes: 'Implementación pagada. Meses 1 y 2 de licencia pagados. Facturación mensual. La factura del mes actual sigue pendiente, pero la cuenta está al corriente en lo demás.',
    },
  },
  {
    id: 'manprec',
    name: 'Manprec',
    arrUsd: 18000,
    billingCadence: 'monthly',
    customerSince: '2026-07-01',
    champions: ['Adriana'],
    users: { total: 10 },
    projects: { total: 13, active: 11 },
    modulesUsed: ['Workspace', 'Analysis', 'Technical Analysis', 'Clarification Meetings', 'Reports'],
    keyContextNotes: [
      'Contract and kickoff July 2026; July/August treated as implementation.',
      'Formal licensing begins September 2026.',
      'Team is still learning and actively exploring many capabilities.',
      'Already generated outputs perceived as valuable; strong interest and momentum.',
      'Regulatory Documentation implementation will begin next.',
      'CS reports 12 total projects; Command Center showed 11 active projects at snapshot.',
      'Actualización 9 sep: las reuniones siguen yendo muy bien; el uso está activo, el equipo es proactivo, el champion es fuerte y varios especialistas participan en un workflow técnico real.',
      'Existe fricción técnica por errores recientes de proyecto, análisis detenido cerca de 2%, documentos/manuales pesados y conversión .doc.',
    ],
    commercial: {
      status: 'at_risk',
      notes: 'Sólo 50% de la implementación está pagado. El primer mes de licencia ya está vencido y el cliente no ha respondido con fecha de pago / respuesta.',
    },
  },
  {
    id: 'fibroptica',
    name: 'Fibroptica',
    arrUsd: 9000,
    // PROJECT_CONTEXT.md does not state "Paid monthly" for Fibroptica as explicitly as
    // it does for Grupo Balle/Manprec, but describes ARR the same way ("annualized").
    // Treated as monthly by inference from that pattern — flagged in the Phase 1 report.
    billingCadence: 'monthly',
    customerSince: '2026-06-01',
    champions: ['Jose Manuel'],
    users: { total: 13, active: 3 },
    projects: { total: 12, active: 9 },
    modulesUsed: ['Workspace', 'Analysis', 'Clarification Meetings', 'Reports'],
    keyContextNotes: [
      'Kickoff and implementation June 2026 (month 1 July, month 2 August, month 3 September).',
      "Has generated valuable outputs; customer has validated monico's analysis capabilities.",
      'Adoption breadth remains limited.',
      'Open question: whether 3 active users are the correct required operating roles, or represent broader adoption risk.',
      'Actualización 9 sep: la sesión semanal fue cancelada por el cliente con solicitud de reagendar; no hay nueva fecha confirmada.',
      'El pago anual está confirmado y cubre la licencia hasta septiembre 2027; los cambios propuestos al contrato/NDA están en revisión.',
      'Existe uso reciente de producto, pero aún falta evidencia cualitativa explícita reciente de resultado/valor de negocio de esos proyectos.',
    ],
    commercial: {
      status: 'current',
      notes: 'Pago anual confirmado, con cobertura de licencia hasta septiembre 2027. Cambios de contrato/NDA en revisión.',
    },
  },
  {
    id: 'asch',
    name: 'ASCH',
    headerSubtitle: 'Construction vertical discovery',
    // No contract signed yet — pre_contract. arrUsd/billingCadence/customerSince
    // are not yet determined; PROJECT_CONTEXT.md does not cover ASCH, so no
    // financial figures are fabricated here (spec: discovery-stage fixture only).
    arrUsd: 0,
    billingCadence: 'annual',
    customerSince: '2026-09-08',
    champions: [],
    users: { total: 0 },
    modulesUsed: [],
    keyContextNotes: [
      'New construction vertical discovery customer. No product usage or historical baseline yet.',
      'Kickoff / onboarding ocurrió el martes 8 sep a las 11:00; la sesión fue positiva y el cliente expresó alto interés y entusiasmo por comenzar a usar monico.',
      'Liberar un vault pre-contract y dar soporte guiado fueron decisiones intencionales de Commercial/CS para identificar el Construction Happy Path y demostrar First Value con capacidades actuales.',
      'El cliente planea subir documentos y probar; esta semana es difícil por licitaciones activas, con Review de progreso sugerido para el próximo martes.',
      'Las ideas de producto para construcción deben capturarse separadas de la validación actual del Happy Path.',
    ],
    commercial: {
      status: 'pending',
      notes: 'Pre-contract discovery for a new vertical (construction). No payment or invoicing yet.',
    },
  },
];
