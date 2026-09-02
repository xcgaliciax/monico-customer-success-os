// Platform/operational telemetry from the monico Command Center. This measures the
// PLATFORM, not the customer — it must never feed HealthScore or be presented as
// the Customer HealthScore. Always MEDIDO: this is the one class of data actually
// sourced from live system telemetry rather than a CS-captured baseline.
export interface PlatformTelemetrySnapshot {
  id: string;
  customerId: string;
  snapshotDate: string; // ISO date
  platformProcessingHealthScore: number; // 0-100, distinct from Customer HealthScore
  processingSuccessRatePct: number;
  activeProjects: number;
  completedProjects: number;
  avgProcessingTimeLabel: string; // e.g. "~6 min"
  p95ProcessingTimeLabel: string; // e.g. "21 min 12 s"
  tokensConsumed: number;
  costUsdTotal: number;
  costUsdFromFailures: number;
  archivedErrors: number;
  trashedCount: number;
  sourceRef?: string; // e.g. "E03"
}
