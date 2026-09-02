import type { ValueMetricEntry } from '../types/valueMetric';

// Executive value anchors (spec §11, "Forma ejecutiva") — maximum three, each
// traceable to a real Evidence record. Only Siemens is seeded in Phase 3A.
export const valueMetrics: ValueMetricEntry[] = [
  {
    id: 'value-siemens-operational-time',
    customerId: 'siemens',
    value: '-50%',
    label: 'tiempo operativo documentado',
    relatedEvidenceId: 'ev-siemens-case-study',
  },
  {
    id: 'value-siemens-tenders-per-year',
    customerId: 'siemens',
    value: '180–250',
    label: 'licitaciones al año con seis personas',
    relatedEvidenceId: 'ev-siemens-case-study',
  },
  {
    id: 'value-siemens-regional-rollout',
    customerId: 'siemens',
    value: '10 países',
    label: 'despliegue regional en estructuración',
    relatedEvidenceId: 'ev-siemens-expansion',
  },
];
