import type { Insight } from '../types/insight';

// Curated closed conclusions — spec §10. Each statement is sustained by an existing
// Evidence record; only Siemens is seeded in Phase 3A.
export const insights: Insight[] = [
  // Resumen — "Por qué este puntaje"
  {
    id: 'insight-siemens-value-verified',
    customerId: 'siemens',
    section: 'why_score',
    statement: 'Valor verificado y documentado',
    context: 'Caso de éxito y stress test respaldan el resultado',
    relatedEvidenceIds: ['ev-siemens-case-study'],
  },
  {
    id: 'insight-siemens-independent-use',
    customerId: 'siemens',
    section: 'why_score',
    statement: 'Uso recurrente e independiente',
    context: 'El equipo de México opera monico sin acompañamiento',
    relatedEvidenceIds: ['ev-siemens-tender-coverage'],
  },
  {
    id: 'insight-siemens-regional-expansion',
    customerId: 'siemens',
    section: 'why_score',
    statement: 'Expansión regional impulsada por Siemens',
    context: 'El caso de México moviliza el despliegue a 10 países',
    relatedEvidenceIds: ['ev-siemens-expansion'],
  },

  // Adopción — "Insights de adopción"
  {
    id: 'insight-siemens-adoption-independent-ops',
    customerId: 'siemens',
    section: 'adoption',
    statement: 'La operación es independiente de monico Customer Success.',
    relatedEvidenceIds: ['ev-siemens-tender-coverage'],
  },
  {
    id: 'insight-siemens-adoption-coverage',
    customerId: 'siemens',
    section: 'adoption',
    statement:
      'La cobertura del flujo relevante se estima superior al 90%, aunque no todos los procesos recorren todos los módulos.',
    relatedEvidenceIds: ['ev-siemens-tender-coverage'],
  },
  {
    id: 'insight-siemens-adoption-role-activation',
    customerId: 'siemens',
    section: 'adoption',
    statement: '15 de 25 usuarios registran actividad; la activación de roles requeridos es más relevante que la utilización total de asientos.',
  },
];
