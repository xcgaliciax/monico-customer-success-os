import { getEvidenceForCustomer, getValueMetricsForCustomer } from '../../services/customerRepository';
import { deriveEvidenceProvenance, getCustomerHeaderViewModel } from './shared';
import type { CustomerHeaderViewModel } from './shared';
import type { Evidence } from '../../types/evidence';
import type { Provenance } from '../../types/provenance';
import type { ValueMetricEntry } from '../../types/valueMetric';

// buildCustomerValueView — the Valor tab view-model. Always renders the full
// evidence-backed row list (spec §11 "forma profunda"); Siemens additionally has
// quantified executive anchors. Usage metrics are never relabeled as Value.

export interface ValueEvidenceRow {
  evidence: Evidence;
  provenance: Provenance;
}

export interface CustomerValueView {
  header: CustomerHeaderViewModel;
  executiveMetrics: ValueMetricEntry[]; // empty when the account has no quantified anchors
  evidenceRows: ValueEvidenceRow[];
}

export function buildCustomerValueView(customerId: string): CustomerValueView | undefined {
  const header = getCustomerHeaderViewModel(customerId);
  if (!header) return undefined;

  const evidenceRows = getEvidenceForCustomer(customerId)
    .filter((item) => item.relatedDimension === 'valueProgress' || item.category === 'value_realization')
    .map((item) => ({ evidence: item, provenance: deriveEvidenceProvenance(item) }));

  return {
    header,
    executiveMetrics: getValueMetricsForCustomer(customerId),
    evidenceRows,
  };
}
