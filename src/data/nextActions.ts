import type { NextAction } from '../types/nextAction';

// Only Siemens is seeded in Phase 3A.
export const nextActions: NextAction[] = [
  {
    id: 'next-siemens-summary-lam-rollout',
    customerId: 'siemens',
    scope: 'summary',
    headline: 'Despliegue regional LAM',
    meta: '10 países · preparación para expansión alta',
    relatedMilestoneId: 'milestone-siemens-lam-rollout',
  },
  {
    id: 'next-siemens-adoption-sustain-depth',
    customerId: 'siemens',
    scope: 'adoption',
    headline: 'Mantener la profundidad de adopción durante el despliegue regional y validar la activación de roles por país.',
  },
];
