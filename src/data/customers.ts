import type { Customer } from '../types/customer';

// Stable account metadata for the four v0.1 pilot accounts, transcribed from
// PROJECT_CONTEXT.md. Fields not supported by that document are omitted rather
// than approximated (see Phase 1 report for the full list of such omissions).
export const customers: Customer[] = [
  {
    id: 'siemens',
    name: 'Siemens',
    arrUsd: 24000,
    billingCadence: 'annual',
    customerSince: '2025-01-01',
    champions: ['Ariadne', 'Alexis'],
    users: { total: 25, active: 15 },
    projects: { total: 73 },
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
    projects: { total: 16, active: 12 },
    modulesUsed: ['Workspace', 'Analysis', 'Reports', 'Clarification Meetings'],
    keyContextNotes: [
      'Kickoff recorded April 2026; effective implementation primarily occurred in May after delays.',
      'First effective license month was July 2026 — September 2026 begins month 3.',
      'María is currently a highly active user; Jair is also relevant.',
      'CS reports 16 total projects; Command Center showed 12 active projects at snapshot.',
      'Output generation has increased significantly in recent weeks; adoption trajectory is improving.',
      'Multivault capability is only now being activated.',
    ],
    commercial: {
      status: 'current',
      notes: 'Implementation paid. License months 1 and 2 paid. Monthly billing.',
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
    projects: { total: 12, active: 11 },
    modulesUsed: ['Workspace', 'Analysis', 'Technical Analysis', 'Clarification Meetings', 'Reports'],
    keyContextNotes: [
      'Contract and kickoff July 2026; July/August treated as implementation.',
      'Formal licensing begins September 2026.',
      'Team is still learning and actively exploring many capabilities.',
      'Already generated outputs perceived as valuable; strong interest and momentum.',
      'Regulatory Documentation implementation will begin next.',
      'CS reports 12 total projects; Command Center showed 11 active projects at snapshot.',
    ],
    commercial: {
      status: 'upcoming',
      notes: 'Half of implementation paid. First license invoice goes out September 2026.',
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
    projects: { active: 9 },
    modulesUsed: ['Workspace', 'Analysis', 'Clarification Meetings', 'Reports'],
    keyContextNotes: [
      'Kickoff and implementation June 2026 (month 1 July, month 2 August, month 3 September).',
      "Has generated valuable outputs; customer has validated monico's analysis capabilities.",
      'Adoption breadth remains limited.',
      'Open question: whether 3 active users are the correct required operating roles, or represent broader adoption risk.',
    ],
    commercial: {
      status: 'current',
      notes: 'Implementation + month 1 paid. Customer is considering paying the remaining annual balance in full.',
    },
  },
];
