// Measured platform/product usage facts aggregated over an EXPLICIT time
// window. Distinct from PlatformTelemetrySnapshot (types/platformTelemetry.ts),
// which is a single point-in-time Command Center read used by the Adopción
// tab's display card. ProductMetricSnapshot exists for windowed weekly-report
// and trend computation, and is the intended future ingestion target for
// product telemetry / Google Sheets — do not assume a snapshot always covers
// "the last 7 days"; always read windowStart/windowEnd.
//
// platformHealth measures the PLATFORM, never Customer (CS) Health — it must
// never be fed into HealthDimensions or healthEngine. projectsErroredInWindow
// (project-level processing failures) and platformErrorsInWindow (platform-
// level error events) are deliberately distinct counters; never infer one
// from the other.
export type ProductMetricSource = 'product_telemetry' | 'manual_entry' | 'google_sheets';

export interface ProductMetricSnapshot {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date — when this snapshot was captured/computed
  windowStart: string; // ISO date, inclusive
  windowEnd: string; // ISO date, inclusive
  projectsTotal: number;
  usersTotal: number;
  projectsCreatedInWindow: number;
  projectsCompletedInWindow: number;
  projectsErroredInWindow: number;
  platformHealth: number; // 0-100, platform processing health — NOT csHealth
  avgAnalysisSeconds: number;
  llmTokensInWindow: number;
  platformErrorsInWindow: number;
  source: ProductMetricSource;
}
