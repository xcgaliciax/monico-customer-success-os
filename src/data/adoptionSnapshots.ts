import type { AdoptionSnapshot } from '../types/adoption';

// Adoption-domain seed for all four v0.1 pilot accounts, transcribed from the
// approved Customer 360 · Adopción screen (Siemens) and PROJECT_CONTEXT.md /
// sprint account baselines. Fields are omitted rather than guessed wherever the
// source document doesn't support them (see per-account comments below).
export const adoptionSnapshots: AdoptionSnapshot[] = [
  {
    id: 'adoption-siemens-2026-09-01',
    customerId: 'siemens',
    snapshotDate: '2026-09-01',
    blockerSummary: 'sin blocker material',
    // Corrected per CS: a CS-captured baseline, never MEDIDO, even though the count is exact.
    activeUsersProvenance: { class: 'confirmed_by_cs', confidence: 'high' },
    workflowCoverage: { estimatePct: 90, comparator: 'gt', provenance: { class: 'confirmed_by_cs', confidence: 'medium' } },
    independentOperation: { status: 'confirmed', provenance: { class: 'confirmed_by_cs' } },
    // Corrected per CS: a CS-captured baseline, never MEDIDO.
    projectsProvenance: { class: 'confirmed_by_cs' },
    moduleUsage: [
      {
        module: 'Workspace',
        state: 'recurring',
        evidenceStatement: 'Licitaciones reales gestionadas en el flujo principal',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Analysis',
        state: 'recurring',
        evidenceStatement: 'Base del análisis de requisitos por licitación',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Technical Analysis',
        state: 'recurring',
        evidenceStatement: 'Stress test: 85% de cumplimiento con citas exactas',
        provenance: { class: 'confirmed_by_client' },
      },
      {
        module: 'Clarification Meetings',
        state: 'recurring',
        evidenceStatement: 'Parte del procedimiento cubierto por el equipo',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Reports',
        state: 'recurring',
        evidenceStatement: 'Ajustes solicitados al Resumen Ejecutivo para decisiones reales',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Notes',
        state: 'selective',
        evidenceStatement: 'Reportado en uso; sin detalle de frecuencia',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Tasks',
        state: 'selective',
        evidenceStatement: 'Reportado en uso; sin detalle de frecuencia',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Search',
        state: 'no_evidence',
        evidenceStatement: 'No hay evidencia de uso para esta cuenta',
        provenance: { class: 'unknown' },
      },
      {
        module: 'Regulatory Documentation',
        state: 'not_applicable',
        evidenceStatement: 'Pendiente de aprobación de TI de Siemens',
        provenance: { class: 'confirmed_by_cs' },
      },
    ],
    workflowDepth: [
      { order: 1, label: 'Flujo iniciado en una licitación real', status: 'confirmed' },
      { order: 2, label: 'Análisis ejecutado sobre las bases', status: 'confirmed' },
      { order: 3, label: 'Output generado', status: 'confirmed_frequent' },
      { order: 4, label: 'Reporte usado en una decisión', status: 'confirmed' },
      { order: 5, label: 'Tarea o nota creada en el proceso', status: 'reported_no_telemetry' },
      { order: 6, label: 'Cierre sin apoyo de Customer Success', status: 'confirmed' },
    ],
    perUserTelemetryAvailable: false,
  },
  {
    id: 'adoption-balle-2026-09-01',
    customerId: 'grupo-balle',
    snapshotDate: '2026-09-01',
    blockerSummary: 'activación de Multivault en curso',
    activeUsersProvenance: { class: 'confirmed_by_cs', confidence: 'high' },
    // No workflow-coverage estimate exists for this account — omitted rather than guessed.
    independentOperation: { status: 'developing', provenance: { class: 'confirmed_by_cs' } },
    projectsProvenance: { class: 'confirmed_by_cs' },
    moduleUsage: [
      {
        module: 'Workspace',
        state: 'recurring',
        evidenceStatement: 'Uso central del flujo de trabajo',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Analysis',
        state: 'recurring',
        evidenceStatement: 'Base del análisis de proyectos',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Reports',
        state: 'recurring',
        evidenceStatement: 'Generación de output en aumento en semanas recientes',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Clarification Meetings',
        state: 'selective',
        evidenceStatement: 'Uso reportado, de menor frecuencia que el resto del flujo',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Multivault',
        state: 'in_use',
        evidenceStatement: 'Activación en curso; aún sin uso recurrente confirmado',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Search',
        state: 'no_evidence',
        evidenceStatement: 'No hay evidencia de uso para esta cuenta',
        provenance: { class: 'unknown' },
      },
    ],
    // No step-by-step workflow-depth narrative exists for this account — omitted.
    perUserTelemetryAvailable: false,
  },
  {
    id: 'adoption-manprec-2026-09-01',
    customerId: 'manprec',
    snapshotDate: '2026-09-01',
    blockerSummary: 'equipo aún en aprendizaje, explorando múltiples capacidades',
    // Active-user count is UNKNOWN for this account (per CS) — provenance omitted
    // because there is no number to attach it to.
    independentOperation: { status: 'developing', provenance: { class: 'confirmed_by_cs' } },
    projectsProvenance: { class: 'confirmed_by_cs' },
    moduleUsage: [
      {
        module: 'Workspace',
        state: 'in_use',
        evidenceStatement: 'Uso reportado por el equipo; frecuencia aún no establecida',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Analysis',
        state: 'in_use',
        evidenceStatement: 'Uso reportado por el equipo; frecuencia aún no establecida',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Technical Analysis',
        state: 'in_use',
        evidenceStatement: 'Uso reportado por el equipo; frecuencia aún no establecida',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Clarification Meetings',
        state: 'in_use',
        evidenceStatement: 'Uso reportado por el equipo; frecuencia aún no establecida',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Reports',
        state: 'in_use',
        evidenceStatement: 'Ya se han generado outputs percibidos como valiosos',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Regulatory Documentation',
        state: 'not_applicable',
        evidenceStatement: 'Implementación inicia próximamente',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Search',
        state: 'no_evidence',
        evidenceStatement: 'No hay evidencia de uso para esta cuenta',
        provenance: { class: 'unknown' },
      },
    ],
    perUserTelemetryAvailable: false,
  },
  {
    id: 'adoption-fibroptica-2026-09-01',
    customerId: 'fibroptica',
    snapshotDate: '2026-09-01',
    blockerSummary: 'activación de roles requeridos es la pregunta clave de adopción',
    activeUsersProvenance: { class: 'confirmed_by_cs', confidence: 'high' },
    // Independent-operation status is not stated either way for this account — omitted.
    projectsProvenance: { class: 'confirmed_by_cs' },
    moduleUsage: [
      {
        module: 'Workspace',
        state: 'in_use',
        evidenceStatement: 'Uso reportado; adopción por módulo aún no instrumentada',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Analysis',
        state: 'in_use',
        evidenceStatement: 'Uso reportado; adopción por módulo aún no instrumentada',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Clarification Meetings',
        state: 'in_use',
        evidenceStatement: 'Uso reportado; adopción por módulo aún no instrumentada',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Reports',
        state: 'in_use',
        evidenceStatement: 'Uso reportado; adopción por módulo aún no instrumentada',
        provenance: { class: 'confirmed_by_cs' },
      },
      {
        module: 'Search',
        state: 'no_evidence',
        evidenceStatement: 'No hay evidencia de uso para esta cuenta',
        provenance: { class: 'unknown' },
      },
    ],
    perUserTelemetryAvailable: false,
  },
];
