import type { Milestone } from '../types/milestone';

// One "primary next milestone" per account, transcribed directly from PROJECT_CONTEXT.md.
export const milestones: Milestone[] = [
  {
    id: 'milestone-siemens-lam-rollout',
    customerId: 'siemens',
    title: 'LAM regional rollout agreement',
    status: 'planned',
    category: 'expansion',
  },
  {
    id: 'milestone-balle-sustained-usage',
    customerId: 'grupo-balle',
    title: 'Sustained repeat workflow usage',
    status: 'planned',
    category: 'adoption',
  },
  {
    id: 'milestone-manprec-transition',
    customerId: 'manprec',
    title: 'Transition successfully from implementation into repeatable licensed usage',
    status: 'planned',
    category: 'adoption',
  },
  {
    id: 'milestone-fibroptica-adoption',
    customerId: 'fibroptica',
    title: 'Confirm and expand sustainable operational adoption',
    status: 'planned',
    category: 'adoption',
  },
];
