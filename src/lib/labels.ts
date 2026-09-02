import type { Confidence, DimensionKey, ExpansionReadiness, HealthStatus, Lifecycle, Trend } from '../types/health';
import type { ModuleKey, ModuleUsageState, WorkflowDepthStepStatus } from '../types/adoption';
import type { ProvenanceClass } from '../types/provenance';

// Centralized human-readable copy for enum-typed fields, shared by portfolio.ts and
// every component that renders one of these values.
export const STATUS_LABELS: Record<HealthStatus, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

export const TREND_LABELS: Record<Trend, string> = {
  improving: 'Improving',
  stable: 'Stable',
  deteriorating: 'Deteriorating',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  implementation: 'Implementation',
  first_value: 'First Value',
  adoption: 'Adoption',
  independent_adoption: 'Independent Adoption',
  verified_outcome: 'Verified Outcome',
};

// Spanish LATAM copy for the Customer 360 UI/UX Spec v0.1 (§ idioma de producto).
// English labels above remain in place for the pre-redesign Portfolio Health screen.
export const STATUS_LABELS_ES: Record<HealthStatus, string> = {
  green: 'VERDE',
  yellow: 'AMARILLO',
  red: 'ROJO',
};

// HealthStatus -> Badge color (spec §04: Badge color="green|orange|red" — the
// "yellow" band is rendered as orange, never as a fourth palette value).
export const STATUS_BADGE_COLOR: Record<HealthStatus, 'green' | 'orange' | 'red'> = {
  green: 'green',
  yellow: 'orange',
  red: 'red',
};

export const TREND_LABELS_ES: Record<Trend, { label: string; arrow: '↑' | '→' | '↓' }> = {
  improving: { label: 'Mejorando', arrow: '↑' },
  stable: { label: 'Estable', arrow: '→' },
  deteriorating: { label: 'Empeorando', arrow: '↓' },
};

export const CONFIDENCE_LABELS_ES: Record<Confidence, string> = {
  high: 'alta',
  medium: 'media',
  low: 'baja',
};

export const CONFIDENCE_TAG_LABELS_ES: Record<Confidence, string> = {
  high: 'CONF. ALTA',
  medium: 'CONF. MEDIA',
  low: 'CONF. BAJA',
};

export const LIFECYCLE_LABELS_ES: Record<Lifecycle, string> = {
  implementation: 'Implementación',
  first_value: 'Primer valor',
  adoption: 'Adopción',
  independent_adoption: 'Adopción independiente',
  verified_outcome: 'Resultado verificado',
};

export const EXPANSION_READINESS_LABELS_ES: Record<ExpansionReadiness, string> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
};

export const PROVENANCE_CLASS_LABELS_ES: Record<ProvenanceClass, string> = {
  measured: 'MEDIDO',
  confirmed_by_client: 'CONFIRMADO POR CLIENTE',
  confirmed_by_cs: 'CONFIRMADO POR CS',
  inferred: 'INFERIDO',
  unknown: 'DESCONOCIDO',
};

export const MODULE_LABELS_ES: Record<ModuleKey, string> = {
  Workspace: 'Workspace',
  Analysis: 'Análisis de Bases',
  'Technical Analysis': 'Análisis Técnico',
  'Clarification Meetings': 'Junta de Aclaraciones',
  Reports: 'Reportes',
  Notes: 'Notas',
  Tasks: 'Tareas',
  Search: 'Buscador de Licitaciones',
  'Regulatory Documentation': 'Documentación Regulatoria',
};

export const MODULE_USAGE_STATE_LABELS_ES: Record<ModuleUsageState, string> = {
  recurring: 'Uso recurrente',
  selective: 'Uso selectivo',
  low: 'Bajo uso',
  no_evidence: 'Sin evidencia',
  not_applicable: 'No aplica aún',
};

export const WORKFLOW_DEPTH_STATUS_LABELS_ES: Record<WorkflowDepthStepStatus, string> = {
  confirmed: 'Confirmado',
  confirmed_frequent: 'Confirmado · frecuente',
  reported_no_telemetry: 'Reportado, sin telemetría',
};

// Canonical HealthScore dimension display names — Customer Success OS Chapter 04 v0.1.
export const DIMENSION_LABELS_ES: Record<DimensionKey, string> = {
  valueProgress: 'Progreso de Valor',
  workflowAdoption: 'Adopción del Flujo',
  championEngagement: 'Participación del Champion',
  requiredRoleActivation: 'Activación de Roles',
  executionRisk: 'Riesgo de Ejecución',
};
