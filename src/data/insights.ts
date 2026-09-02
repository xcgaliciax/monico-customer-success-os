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

  // Grupo Balle — "Por qué este puntaje"
  {
    id: 'insight-balle-recovery',
    customerId: 'grupo-balle',
    section: 'why_score',
    statement: 'Recuperación tras retrasos de implementación',
    context: 'La implementación efectiva ocurrió en mayo, después de retrasos en el arranque; la cuenta ya opera en su tercer mes de licencia.',
    relatedEvidenceIds: ['ev-balle-kickoff-delay'],
  },
  {
    id: 'insight-balle-momentum',
    customerId: 'grupo-balle',
    section: 'why_score',
    statement: 'Actividad de flujo en aumento',
    context: 'La generación de outputs ha crecido de forma significativa en las últimas semanas.',
    relatedEvidenceIds: ['ev-balle-momentum'],
  },
  {
    id: 'insight-balle-active-coverage',
    customerId: 'grupo-balle',
    section: 'why_score',
    statement: 'Cobertura operativa activa',
    context: '12 de los proyectos reportados están activos en el Command Center.',
    relatedEvidenceIds: ['ev-balle-active-projects'],
  },
  // Grupo Balle — "Insights de adopción"
  {
    id: 'insight-balle-adoption-momentum',
    customerId: 'grupo-balle',
    section: 'adoption',
    statement: 'La generación de outputs aumentó de forma significativa en las últimas semanas.',
    relatedEvidenceIds: ['ev-balle-momentum'],
  },
  {
    id: 'insight-balle-adoption-multivault',
    customerId: 'grupo-balle',
    section: 'adoption',
    statement: 'La activación de Multivault está en curso; aún no hay uso recurrente confirmado.',
    relatedEvidenceIds: ['ev-balle-multivault'],
  },
  {
    id: 'insight-balle-adoption-concentration',
    customerId: 'grupo-balle',
    section: 'adoption',
    statement: '6 de 7 usuarios registran actividad, concentrada en pocos usuarios — normal en esta etapa de adopción.',
  },

  // Manprec — "Por qué este puntaje"
  {
    id: 'insight-manprec-exploration',
    customerId: 'manprec',
    section: 'why_score',
    statement: 'Momentum fuerte de implementación a adopción',
    context: 'El equipo explora activamente múltiples capacidades desde el arranque.',
    relatedEvidenceIds: ['ev-manprec-exploration'],
  },
  {
    id: 'insight-manprec-early-value',
    customerId: 'manprec',
    section: 'why_score',
    statement: 'Valor percibido desde etapas tempranas',
    context: 'Ya se han generado outputs percibidos como valiosos, aun en implementación.',
    relatedEvidenceIds: ['ev-manprec-exploration'],
  },
  {
    id: 'insight-manprec-active-coverage',
    customerId: 'manprec',
    section: 'why_score',
    statement: 'Cobertura operativa activa',
    context: '11 de los proyectos reportados están activos en el Command Center.',
    relatedEvidenceIds: ['ev-manprec-active-projects'],
  },
  // Manprec — "Insights de adopción"
  {
    id: 'insight-manprec-adoption-exploration',
    customerId: 'manprec',
    section: 'adoption',
    statement: 'El equipo explora activamente múltiples capacidades desde el arranque.',
    relatedEvidenceIds: ['ev-manprec-exploration'],
  },
  {
    id: 'insight-manprec-adoption-unknown-users',
    customerId: 'manprec',
    section: 'adoption',
    statement: 'El conteo de usuarios activos aún no está disponible; el uso se reporta a nivel de equipo.',
  },
  {
    id: 'insight-manprec-adoption-next-module',
    customerId: 'manprec',
    section: 'adoption',
    statement: 'La Documentación Regulatoria iniciará como próximo módulo.',
    relatedEvidenceIds: ['ev-manprec-next-module'],
  },

  // Fibroptica — "Por qué este puntaje"
  {
    id: 'insight-fibroptica-validated-value',
    customerId: 'fibroptica',
    section: 'why_score',
    statement: 'Valor analítico validado por el cliente',
    context: 'El cliente ha validado la capacidad analítica de monico y generado outputs valiosos.',
    relatedEvidenceIds: ['ev-fibroptica-validation'],
  },
  {
    id: 'insight-fibroptica-role-question',
    customerId: 'fibroptica',
    section: 'why_score',
    statement: 'Adopción por rol es la pregunta abierta',
    context: 'Sólo 3 de 13 usuarios están activos; se requiere confirmar si son los roles operativos correctos.',
    relatedEvidenceIds: ['ev-fibroptica-adoption-breadth'],
  },
  {
    id: 'insight-fibroptica-timeline',
    customerId: 'fibroptica',
    section: 'why_score',
    statement: 'Cronograma de implementación cumplido',
    context: 'Kickoff e implementación en junio, con los meses de licencia avanzando según lo previsto.',
    relatedEvidenceIds: ['ev-fibroptica-kickoff'],
  },
  // Fibroptica — "Insights de adopción"
  {
    id: 'insight-fibroptica-adoption-role-question',
    customerId: 'fibroptica',
    section: 'adoption',
    statement: 'Sólo 3 de 13 usuarios están activos; la pregunta clave es si estos son los roles operativos requeridos.',
    relatedEvidenceIds: ['ev-fibroptica-role-question'],
  },
  {
    id: 'insight-fibroptica-adoption-validated',
    customerId: 'fibroptica',
    section: 'adoption',
    statement: 'El cliente ha validado la capacidad analítica de monico.',
    relatedEvidenceIds: ['ev-fibroptica-validation'],
  },
  {
    id: 'insight-fibroptica-adoption-breadth-focus',
    customerId: 'fibroptica',
    section: 'adoption',
    statement: 'La amplitud de adopción, no el valor generado, es la principal área de atención.',
  },
];
