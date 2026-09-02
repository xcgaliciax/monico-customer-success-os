import type { PortfolioSignal } from '../types/signal';

// Cross-portfolio signals for Señales — grounded in PROJECT_CONTEXT.md's "Product
// insight already observed" section and each account's own seed data. No
// statistical precision is invented: usage is described qualitatively (observed /
// not observed), never as a fabricated percentage.
export const signals: PortfolioSignal[] = [
  {
    id: 'signal-buscador-no-usage',
    title: 'Buscador',
    statement: 'Sin evidencia de uso activo en las cuatro cuentas del portafolio actual. Tratar como insight de producto, no como penalización de Customer Health.',
    provenance: { class: 'confirmed_by_cs' },
  },
  {
    id: 'signal-reportes-strong-adoption',
    title: 'Reportes',
    statement: 'Adopción fuerte y observada en todo el portafolio.',
    provenance: { class: 'confirmed_by_cs' },
  },
  {
    id: 'signal-workspace-analysis-core',
    title: 'Workspace / Análisis',
    statement: 'Flujo de trabajo central en las cuatro cuentas.',
    provenance: { class: 'confirmed_by_cs' },
  },
  {
    id: 'signal-clarification-meetings-selective',
    title: 'Junta de Aclaraciones',
    statement: 'Uso más selectivo y de menor frecuencia que el resto del flujo principal.',
    provenance: { class: 'confirmed_by_cs' },
  },
  {
    id: 'signal-siemens-expansion',
    title: 'Siemens',
    statement: 'Señal de expansión fuerte: despliegue regional para 10 países en estructuración, con interés en un rollout global.',
    provenance: { class: 'confirmed_by_cs', confidence: 'high' },
    relatedCustomerId: 'siemens',
  },
  {
    id: 'signal-fibroptica-role-activation',
    title: 'Fibroptica',
    statement: 'La activación de roles requeridos es la pregunta de adopción más clara del portafolio: sólo 3 de 13 usuarios están activos.',
    provenance: { class: 'confirmed_by_cs', confidence: 'medium' },
    relatedCustomerId: 'fibroptica',
  },
];
