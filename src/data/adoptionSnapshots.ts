import type { AdoptionSnapshot } from '../types/adoption';

// Seed transcribed from the approved Customer 360 · Adopción screen (Siemens) and
// PROJECT_CONTEXT.md. Only Siemens is seeded in Phase 3A — no other account has
// this level of curated adoption narrative in the source document.
export const adoptionSnapshots: AdoptionSnapshot[] = [
  {
    id: 'adoption-siemens-2026-09-01',
    customerId: 'siemens',
    snapshotDate: '2026-09-01',
    assessment: { level: 'high', blockerSummary: 'sin blocker material' },
    // Corrected per CS: a CS-captured baseline, never MEDIDO, even though the count is exact.
    activeUsersProvenance: { class: 'confirmed_by_cs', confidence: 'high' },
    workflowCoverage: { estimatePct: 90, comparator: 'gt', provenance: { class: 'confirmed_by_cs', confidence: 'medium' } },
    independentOperationProvenance: { class: 'confirmed_by_cs' },
    // Corrected per CS: a CS-captured baseline, never MEDIDO.
    historicalProjectsProvenance: { class: 'confirmed_by_cs' },
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
];
