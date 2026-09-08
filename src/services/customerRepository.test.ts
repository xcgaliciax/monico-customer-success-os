import { describe, expect, it } from 'vitest';
import { getOperatingStageForCustomer, getProductMetricSnapshotsForCustomer } from './customerRepository';

describe('getOperatingStageForCustomer', () => {
  it('returns the seeded stage for each real account', () => {
    expect(getOperatingStageForCustomer('siemens')?.stage).toBe('operating');
    expect(getOperatingStageForCustomer('grupo-balle')?.stage).toBe('adopting');
    expect(getOperatingStageForCustomer('manprec')?.stage).toBe('proving');
    expect(getOperatingStageForCustomer('fibroptica')?.stage).toBe('adopting');
  });

  it('returns the confirmed source and asOfDate', () => {
    const stage = getOperatingStageForCustomer('siemens');
    expect(stage?.source).toBe('cs_manual');
    expect(stage?.asOfDate).toBe('2026-09-08');
  });

  it('returns undefined for an unknown customer', () => {
    expect(getOperatingStageForCustomer('unknown-customer')).toBeUndefined();
  });
});

describe('getProductMetricSnapshotsForCustomer', () => {
  it('returns the seeded snapshot for each real account', () => {
    expect(getProductMetricSnapshotsForCustomer('siemens')).toHaveLength(1);
    expect(getProductMetricSnapshotsForCustomer('grupo-balle')).toHaveLength(1);
    expect(getProductMetricSnapshotsForCustomer('manprec')).toHaveLength(1);
    expect(getProductMetricSnapshotsForCustomer('fibroptica')).toHaveLength(1);
  });

  it('sorts snapshots ascending by windowEnd', () => {
    const snapshots = getProductMetricSnapshotsForCustomer('siemens');
    const windowEnds = snapshots.map((snapshot) => snapshot.windowEnd);
    expect(windowEnds).toEqual([...windowEnds].sort((a, b) => a.localeCompare(b)));
  });

  it('returns an empty array for an unknown customer', () => {
    expect(getProductMetricSnapshotsForCustomer('unknown-customer')).toEqual([]);
  });

  it('keeps projectsErroredInWindow and platformErrorsInWindow as distinct facts (Manprec)', () => {
    const [manprecMetrics] = getProductMetricSnapshotsForCustomer('manprec');
    expect(manprecMetrics.projectsErroredInWindow).toBe(2);
    expect(manprecMetrics.platformErrorsInWindow).toBe(3);
  });
});
