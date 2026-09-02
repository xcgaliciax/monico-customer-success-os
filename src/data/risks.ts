import type { Risk } from '../types/risk';

// Only accounts with an explicitly stated risk/concern/dependency in PROJECT_CONTEXT.md
// have a Risk record. Manprec has no "Primary concern" or comparable line in the source
// document, so no Risk was fabricated for it — see the Phase 1 report.
export const risks: Risk[] = [
  {
    id: 'risk-siemens-regulatory-doc-approval',
    customerId: 'siemens',
    title: 'Regulatory Documentation module pending Siemens IT approval',
    description:
      'External dependency on Siemens IT approval for the Regulatory Documentation module. Explicitly treated as low-severity and not a customer-health blocker.',
    severity: 'low',
    status: 'monitoring',
    dependencyType: 'external',
    relatedDimension: 'executionRisk',
    shortTitle: 'Documentación Regulatoria',
    shortCause: 'Pendiente de aprobación de TI de Siemens',
    dependencyTypeLabel: 'Dependencia externa',
    healthImpactStatement: 'Sin impacto actual en HealthScore',
  },
  {
    id: 'risk-balle-adoption-momentum',
    customerId: 'grupo-balle',
    title: 'Dependence on implementation/support momentum',
    description:
      'Primary concern is sustaining recent workflow adoption gains and reducing reliance on implementation/support-driven momentum.',
    severity: 'medium',
    status: 'open',
    relatedDimension: 'workflowAdoption',
  },
  {
    id: 'risk-fibroptica-role-activation',
    customerId: 'fibroptica',
    title: 'Required-role activation / adoption breadth',
    description:
      'Only ~3 of 13 users are active. Unclear whether this reflects the correct set of required operating roles or a broader adoption-breadth risk.',
    severity: 'medium',
    status: 'open',
    relatedDimension: 'requiredRoleActivation',
  },
];
