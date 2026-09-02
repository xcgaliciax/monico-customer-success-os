import type { NextAction } from '../types/nextAction';

// One NextAction per account — reused as both the Resumen "Qué sigue" panel and
// the closing "Siguiente acción" line on every deep tab (scope is informational;
// getNextActionsForCustomer() ignores it when no scope is passed).
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
    id: 'next-balle-summary-sustained-usage',
    customerId: 'grupo-balle',
    scope: 'summary',
    headline: 'Uso recurrente sostenido del flujo',
    meta: 'activación de Multivault en curso',
    relatedMilestoneId: 'milestone-balle-sustained-usage',
  },
  {
    id: 'next-manprec-summary-transition',
    customerId: 'manprec',
    scope: 'summary',
    headline: 'Transición a uso licenciado repetible',
    meta: 'facturación formal desde septiembre 2026',
    relatedMilestoneId: 'milestone-manprec-transition',
  },
  {
    id: 'next-fibroptica-summary-role-activation',
    customerId: 'fibroptica',
    scope: 'summary',
    headline: 'Confirmar y ampliar la adopción operativa sostenible',
    meta: '3 de 13 usuarios activos actualmente',
    relatedMilestoneId: 'milestone-fibroptica-adoption',
  },
];
