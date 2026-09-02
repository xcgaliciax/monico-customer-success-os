import type { PlatformTelemetrySnapshot } from '../types/platformTelemetry';

// Operational snapshot from the monico Command Center. This is platform telemetry,
// not Customer Health — it must never be blended into HealthScore. Confirmed by the
// user as the one class of MEDIDO data in this v0.1 seed (everything else customer-
// facing on the Adoption screen is a CS-captured baseline). Only Siemens is seeded
// in Phase 3A.
export const platformTelemetrySnapshots: PlatformTelemetrySnapshot[] = [
  {
    id: 'platform-siemens-2026-09-01',
    customerId: 'siemens',
    snapshotDate: '2026-09-01',
    platformProcessingHealthScore: 90,
    processingSuccessRatePct: 84,
    activeProjects: 17,
    completedProjects: 21,
    avgProcessingTimeLabel: '~6 min',
    p95ProcessingTimeLabel: '21 min 12 s',
    tokensConsumed: 63_006_855,
    costUsdTotal: 51.02,
    costUsdFromFailures: 0.41,
    archivedErrors: 4,
    trashedCount: 4,
    sourceRef: 'E03',
  },
];
