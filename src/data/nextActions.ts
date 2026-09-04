import type { NextAction } from '../types/nextAction';

// One NextAction per account — reused as both the Resumen "Qué sigue" panel and
// the closing "Siguiente acción" line on every deep tab. Callers that want this
// single tab-level action must pass scope: 'summary' to getNextActionsForCustomer.
//
// Where an account's curated action is also the correct recommended action for a
// specific Risk or Insight (Customer Intelligence attention/opportunity items),
// it is linked via relatedRiskId/relatedInsightId on the SAME record rather than
// duplicated into a second one — see getNextActionForRisk/getNextActionForInsight.
export const nextActions: NextAction[] = [
  {
    id: 'next-siemens-summary-lam-rollout',
    customerId: 'siemens',
    scope: 'summary',
    headline: 'Despliegue regional LAM',
    meta: '10 países · preparación para expansión alta',
    relatedMilestoneId: 'milestone-siemens-lam-rollout',
    relatedInsightId: 'insight-siemens-regional-expansion',
  },
  {
    id: 'next-balle-summary-sustained-usage',
    customerId: 'grupo-balle',
    scope: 'summary',
    headline: 'Uso recurrente sostenido del flujo',
    meta: 'activación de Multivault en curso',
    relatedMilestoneId: 'milestone-balle-sustained-usage',
    relatedRiskId: 'risk-balle-adoption-momentum',
    relatedInsightId: 'insight-balle-momentum',
  },
  {
    id: 'next-manprec-summary-transition',
    customerId: 'manprec',
    scope: 'summary',
    headline: 'Transición a uso licenciado repetible',
    meta: 'facturación formal desde septiembre 2026',
    relatedMilestoneId: 'milestone-manprec-transition',
    relatedInsightId: 'insight-manprec-exploration',
  },
  {
    id: 'next-fibroptica-summary-role-activation',
    customerId: 'fibroptica',
    scope: 'summary',
    headline: 'Confirmar y ampliar la adopción operativa sostenible',
    meta: '3 de 13 usuarios activos actualmente',
    relatedMilestoneId: 'milestone-fibroptica-adoption',
    relatedRiskId: 'risk-fibroptica-role-activation',
  },
];

// Siemens' regulatory-approval risk (risk-siemens-regulatory-doc-approval) is
// intentionally left without a NextAction: PROJECT_CONTEXT.md treats it as a
// low-severity external dependency with no stated next step, so no action is
// fabricated for it — the attention item will show no "Siguiente acción".
