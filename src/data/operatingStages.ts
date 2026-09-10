import type { OperatingStageSnapshot } from '../types/operatingStage';

// Confirmed current manual OperatingStage per real account, as of 2026-09-08.
// Independent of the existing (legacy) Lifecycle values in healthSnapshots.ts —
// do not derive one from the other. One record per customer for v0.1; no
// history is seeded because no prior OperatingStage assessment exists yet.
export const operatingStages: OperatingStageSnapshot[] = [
  {
    id: 'stage-siemens-2026-09-08',
    customerId: 'siemens',
    asOfDate: '2026-09-08',
    stage: 'operating',
    source: 'cs_manual',
  },
  {
    id: 'stage-grupo-balle-2026-09-08',
    customerId: 'grupo-balle',
    asOfDate: '2026-09-08',
    stage: 'adopting',
    source: 'cs_manual',
  },
  {
    id: 'stage-manprec-2026-09-08',
    customerId: 'manprec',
    asOfDate: '2026-09-08',
    stage: 'proving',
    source: 'cs_manual',
  },
  {
    id: 'stage-fibroptica-2026-09-08',
    customerId: 'fibroptica',
    asOfDate: '2026-09-08',
    stage: 'adopting',
    source: 'cs_manual',
  },
  {
    id: 'stage-asch-2026-09-08',
    customerId: 'asch',
    asOfDate: '2026-09-08',
    stage: 'ready',
    source: 'cs_manual',
  },
];
