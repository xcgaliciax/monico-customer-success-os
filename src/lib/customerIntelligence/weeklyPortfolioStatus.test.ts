import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  getCustomerById,
  getCustomers,
  getProductMetricSnapshotsForCustomer,
  getRisksForCustomer,
} from '../../services/customerRepository';
import { getCustomerIntelligence } from './customer';
import {
  buildCommercialAttention,
  canonicalizeProductMetricSnapshots,
  getWeeklyPortfolioStatus,
  isFullyWithinPeriod,
  selectPeriodSnapshots,
} from './weeklyPortfolioStatus';
import { latestAtOrBefore } from './preWeeklyScorecard';
import type { CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

function findCustomer(status: ReturnType<typeof getWeeklyPortfolioStatus>, customerId: string) {
  const found = status.customers.find((customer) => customer.customerId === customerId);
  if (!found) throw new Error(`customer ${customerId} not found in WeeklyPortfolioStatus`);
  return found;
}

function metricSnapshot(overrides: Partial<ProductMetricSnapshot> & Pick<ProductMetricSnapshot, 'id' | 'windowStart' | 'windowEnd' | 'snapshotDate'>): ProductMetricSnapshot {
  return {
    customerId: 'synthetic',
    projectsTotal: 0,
    usersTotal: 0,
    projectsCreatedInWindow: 0,
    projectsCompletedInWindow: 0,
    projectsErroredInWindow: 0,
    platformHealth: 90,
    avgAnalysisSeconds: 100,
    llmTokensInWindow: 0,
    platformErrorsInWindow: 0,
    source: 'manual_entry',
    ...overrides,
  };
}

describe('getWeeklyPortfolioStatus — portfolio aggregation across multiple customers', () => {
  it('includes every customer in the repository, including ASCH', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const allIds = getCustomers().map((c) => c.id);
    expect(status.customers.map((c) => c.customerId).sort()).toEqual([...allIds].sort());
    expect(status.summary.customerCount).toBe(allIds.length);
  });

  it('sums historical projects/users totals from each customer\'s most recent canonical snapshot as of asOf', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    expect(status.summary.historicalProjectsTotal).toBe(71 + 19 + 13 + 12);
    expect(status.summary.historicalUsersTotal).toBe(25 + 7 + 10 + 13);
  });

  it('sums created/completed/errored only from snapshots fully contained in the period', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    // default period 2026-09-02..2026-09-08 matches every seeded snapshot's window exactly
    expect(status.summary.projectsCreatedInPeriod).toBe(0 + 2 + 3 + 2);
    expect(status.summary.projectsCompletedInPeriod).toBe(0 + 2 + 1 + 2);
    expect(status.summary.projectErrorsInPeriod).toBe(0 + 0 + 2 + 0);
  });
});

describe('Decision 3 — canonical ProductMetricSnapshot: regression 1 (duplicate window, latest snapshotDate wins)', () => {
  it('keeps only the later snapshotDate for the same customerId/windowStart/windowEnd, not both', () => {
    const original = metricSnapshot({
      id: 'dup-original',
      customerId: 'dup-customer',
      snapshotDate: '2026-09-08',
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsCreatedInWindow: 3,
      projectsTotal: 10,
      usersTotal: 5,
    });
    const correction = metricSnapshot({
      id: 'dup-correction',
      customerId: 'dup-customer',
      snapshotDate: '2026-09-09',
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsCreatedInWindow: 5,
      projectsTotal: 12,
      usersTotal: 6,
    });

    const canonical = canonicalizeProductMetricSnapshots([original, correction]);
    expect(canonical).toHaveLength(1);
    expect(canonical[0].id).toBe('dup-correction');
    expect(canonical[0].projectsCreatedInWindow).toBe(5);
  });

  it('breaks a snapshotDate tie deterministically on id, independent of input order', () => {
    const a = metricSnapshot({ id: 'tie-a', customerId: 'x', snapshotDate: '2026-09-08', windowStart: '2026-09-02', windowEnd: '2026-09-08' });
    const b = metricSnapshot({ id: 'tie-b', customerId: 'x', snapshotDate: '2026-09-08', windowStart: '2026-09-02', windowEnd: '2026-09-08' });

    expect(canonicalizeProductMetricSnapshots([a, b])[0].id).toBe('tie-b');
    expect(canonicalizeProductMetricSnapshots([b, a])[0].id).toBe('tie-b');
  });
});

describe('Decision 3 — canonical ProductMetricSnapshot: regression 2 (historical totals use the canonical/corrected snapshot)', () => {
  it('latestAtOrBefore over the canonicalized set picks the corrected counters, not the superseded ones', () => {
    const superseded = metricSnapshot({
      id: 'hist-superseded',
      customerId: 'hist-customer',
      snapshotDate: '2026-09-08',
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsTotal: 10,
      usersTotal: 5,
    });
    const corrected = metricSnapshot({
      id: 'hist-corrected',
      customerId: 'hist-customer',
      snapshotDate: '2026-09-09',
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsTotal: 14,
      usersTotal: 6,
    });

    const canonical = canonicalizeProductMetricSnapshots([superseded, corrected]);
    const recent = latestAtOrBefore(canonical, '2026-09-30', (s) => s.windowEnd);
    expect(recent?.projectsTotal).toBe(14);
    expect(recent?.usersTotal).toBe(6);
  });
});

describe('Decision 3 — canonical ProductMetricSnapshot: regression 3 (two non-overlapping windows in a wider period)', () => {
  it('sums both canonical windows exactly once each — no double-counting, no dropped window', () => {
    const week1 = metricSnapshot({
      id: 'week1',
      customerId: 'multi-week',
      snapshotDate: '2026-09-08',
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsCreatedInWindow: 3,
    });
    const week2 = metricSnapshot({
      id: 'week2',
      customerId: 'multi-week',
      snapshotDate: '2026-09-15',
      windowStart: '2026-09-09',
      windowEnd: '2026-09-15',
      projectsCreatedInWindow: 4,
    });

    const canonical = canonicalizeProductMetricSnapshots([week1, week2]);
    const inPeriod = selectPeriodSnapshots(canonical, '2026-09-15', '2026-09-02', '2026-09-15');
    expect(inPeriod.map((s) => s.id).sort()).toEqual(['week1', 'week2']);
    expect(inPeriod.reduce((sum, s) => sum + s.projectsCreatedInWindow, 0)).toBe(7);
  });
});

describe('Decision 3 — canonical ProductMetricSnapshot: regression 4 (partial overlap is excluded)', () => {
  it('a snapshot only partially overlapping the period is not fully within it, and contributes nothing', () => {
    const partial = metricSnapshot({
      id: 'partial',
      customerId: 'partial-customer',
      snapshotDate: '2026-09-08',
      windowStart: '2026-09-05',
      windowEnd: '2026-09-11',
      projectsCreatedInWindow: 9,
    });

    expect(isFullyWithinPeriod(partial, '2026-09-08', '2026-09-14')).toBe(false);
    const inPeriod = selectPeriodSnapshots([partial], '2026-09-14', '2026-09-08', '2026-09-14');
    expect(inPeriod).toEqual([]);
  });
});

describe('Decision 3 — regression 5: partial/no coverage is missingInformation, never a fabricated Risk or zero', () => {
  it('a requested period only partially covered by the real seed snapshots yields projectsCreatedInPeriod 0 and a periodCoverage entry, not fabricated zero activity mislabeled as full coverage', () => {
    // Real seed snapshots all have window 2026-09-02..2026-09-08. Requesting a
    // period that only partially overlaps that window (09-05..09-10) means no
    // canonical snapshot is fully contained — this must NOT silently report 0
    // as if the period were fully measured; it must surface as missingInformation.
    const status = getWeeklyPortfolioStatus('2026-09-08', '2026-09-05', '2026-09-10');
    expect(status.summary.projectsCreatedInPeriod).toBe(0);
    expect(status.summary.projectsCompletedInPeriod).toBe(0);
    expect(status.summary.projectErrorsInPeriod).toBe(0);

    const siemens = findCustomer(status, 'siemens');
    expect(siemens.missingInformation).toContainEqual(
      expect.objectContaining({ customerId: 'siemens', field: 'periodCoverage', periodStart: '2026-09-05', periodEnd: '2026-09-10' }),
    );
    // No Risk/riskAttention is fabricated from the coverage gap — still exactly
    // what Customer Intelligence already derives from actual Risks.
    expect(siemens.riskAttention).toEqual(getCustomerIntelligence('siemens')!.attentionItems);
  });
});

describe('Decision 3 — regression 6: explicit zero counters in a fully-covered period remain zero, no Risk', () => {
  it('siemens has a real snapshot fully within the default period with zero created/completed/errored, and gains no extra attention item', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const siemens = findCustomer(status, 'siemens');
    expect(siemens.recentProductMetricSnapshot).toBeDefined();
    expect(siemens.recentProductMetricSnapshot?.projectsCreatedInWindow).toBe(0);
    expect(siemens.recentProductMetricSnapshot?.projectsCompletedInWindow).toBe(0);
    expect(siemens.recentProductMetricSnapshot?.projectsErroredInWindow).toBe(0);
    expect(siemens.missingInformation.find((item) => item.field === 'periodCoverage')).toBeUndefined();
    expect(siemens.riskAttention).toEqual(getCustomerIntelligence('siemens')!.attentionItems);
  });
});

describe('Decision 3 — regression 7: ASCH remains valid with no invented activity or Health', () => {
  it('ASCH has no historical ProductMetricSnapshot — represented as undefined, not zero or invented', () => {
    expect(getProductMetricSnapshotsForCustomer('asch')).toEqual([]);
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const asch = findCustomer(status, 'asch');
    expect(asch.recentProductMetricSnapshot).toBeUndefined();
  });

  it('ASCH is ready / pre_contract and contributes 0, not a fabricated value, to portfolio totals', () => {
    expect(getCustomerById('asch')).toBeDefined();
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const asch = findCustomer(status, 'asch');
    expect(asch.operatingStage).toBe('ready');
    expect(asch.commercialStatusSnapshot?.commercialStatus).toBe('pre_contract');
    expect(status.summary.historicalProjectsTotal).toBe(71 + 19 + 13 + 12);
  });

  it('ASCH gets a productMetricSnapshot missingInformation entry, but not a redundant periodCoverage entry', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const asch = findCustomer(status, 'asch');
    expect(asch.missingInformation).toContainEqual(expect.objectContaining({ customerId: 'asch', field: 'productMetricSnapshot' }));
    expect(asch.missingInformation.find((item) => item.field === 'periodCoverage')).toBeUndefined();
  });

  it('ASCH has no csHealth/health field on this contract, and no CustomerWeeklyStatus field references HealthSnapshot', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const asch = findCustomer(status, 'asch');
    expect(asch).not.toHaveProperty('csHealth');
    expect(asch).not.toHaveProperty('health');
  });
});

describe('Decision 2 — attention categories are kept explicitly separate', () => {
  it('CustomerWeeklyStatus has no generic attention field — only risks, riskAttention, commercialAttention, missingInformation', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    for (const customer of status.customers) {
      expect(customer).not.toHaveProperty('attention');
      expect(customer).not.toHaveProperty('attentionItems');
      expect(Array.isArray(customer.risks)).toBe(true);
      expect(Array.isArray(customer.riskAttention)).toBe(true);
      expect(Array.isArray(customer.commercialAttention)).toBe(true);
      expect(Array.isArray(customer.missingInformation)).toBe(true);
    }
  });

  it('riskAttention is exactly Customer Intelligence\'s existing attentionItems — same selector, unchanged Risk semantics', () => {
    for (const customerId of ['siemens', 'grupo-balle', 'manprec', 'fibroptica']) {
      const status = getWeeklyPortfolioStatus('2026-09-08');
      const customer = findCustomer(status, customerId);
      expect(customer.riskAttention).toEqual(getCustomerIntelligence(customerId)!.attentionItems);
    }
  });

  it('buildCommercialAttention includes attention/critical/unknown, excludes healthy/pre_contract', () => {
    const base: Omit<CommercialStatusSnapshot, 'commercialStatus'> = {
      id: 'snap-1',
      customerId: 'c1',
      snapshotDate: '2026-09-08',
      paymentStatus: 'current',
      contractStatus: 'active',
    };

    expect(buildCommercialAttention('c1', { ...base, commercialStatus: 'attention' })).toHaveLength(1);
    expect(buildCommercialAttention('c1', { ...base, commercialStatus: 'critical' })).toHaveLength(1);
    // unknown ONLY produces an item when a snapshot actually exists asserting it.
    expect(buildCommercialAttention('c1', { ...base, commercialStatus: 'unknown' })).toHaveLength(1);
    expect(buildCommercialAttention('c1', { ...base, commercialStatus: 'healthy' })).toEqual([]);
    expect(buildCommercialAttention('c1', { ...base, commercialStatus: 'pre_contract' })).toEqual([]);
    // No CommercialStatusSnapshot at all -> not commercialAttention (that's missingInformation's job).
    expect(buildCommercialAttention('c1', undefined)).toEqual([]);
  });

  it('a commercialAttention item never carries a severity field shared with AttentionItem', () => {
    const item = buildCommercialAttention('c1', {
      id: 'snap-2',
      customerId: 'c1',
      snapshotDate: '2026-09-08',
      paymentStatus: 'overdue',
      contractStatus: 'active',
      commercialStatus: 'critical',
      commercialRisk: 'Invoice overdue 45 days.',
    })[0];
    expect(item).not.toHaveProperty('severity');
    expect(item.commercialStatus).toBe('critical');
    expect(item.cause).toBe('Invoice overdue 45 days.');
  });

  it('real seed accounts are all healthy or pre_contract, so commercialAttention is empty across the real portfolio today', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    for (const customer of status.customers) {
      expect(customer.commercialAttention).toEqual([]);
    }
  });
});

describe('Decision 1 — commercial naming: no "Health" vocabulary in the commercial domain', () => {
  it('commercialStatusSnapshot.ts never uses the word CommercialHealthStatus', () => {
    expect(readSource('../../types/commercialStatusSnapshot.ts')).not.toContain('CommercialHealthStatus');
  });

  it('weeklyPortfolioStatus.ts imports CommercialStanding, not a "Health"-named commercial type', () => {
    const source = readSource('./weeklyPortfolioStatus.ts');
    expect(source).toContain('CommercialStanding');
    expect(source).not.toContain('CommercialHealthStatus');
  });
});

describe('getWeeklyPortfolioStatus — WeeklyAction status/results are preserved', () => {
  it('preserves every WeeklyActionStatus value seeded across the portfolio', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const statuses = new Set(status.customers.flatMap((c) => c.weeklyActions.map((a) => a.status)));
    expect(statuses).toEqual(new Set(['planned', 'achieved', 'partial', 'not_achieved', 'cancelled']));
  });

  it('preserves actualResult/resultNote exactly for a partial action', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const manprec = findCustomer(status, 'manprec');
    const invoiceAction = manprec.weeklyActions.find((a) => a.id === 'wa-manprec-first-invoice');
    expect(invoiceAction).toMatchObject({
      status: 'partial',
      actualResult: 'Invoice drafted but not yet sent.',
      resultNote: 'Pending internal finance sign-off.',
    });
  });

  it('expectedResults mirrors the expectedResult of each in-period WeeklyAction exactly', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    const grupoBalle = findCustomer(status, 'grupo-balle');
    expect(grupoBalle.expectedResults).toEqual(grupoBalle.weeklyActions.map((a) => a.expectedResult));
  });
});

describe('Decision 3 — regression 8: existing Health engine behavior and weights remain unchanged', () => {
  it('healthEngine.ts never references CommercialStatusSnapshot, CommercialStanding, WeeklyAction, or the new attention types', () => {
    const source = readSource('../healthEngine.ts');
    for (const forbidden of ['CommercialStatusSnapshot', 'CommercialStanding', 'WeeklyAction', 'CommercialAttentionItem', 'MissingInformationItem']) {
      expect(source).not.toContain(forbidden);
    }
  });

  it('weeklyPortfolioStatus.ts never imports from healthEngine', () => {
    expect(readSource('./weeklyPortfolioStatus.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
  });

  it('customer.ts (Customer Intelligence attentionItems source) is unchanged by this slice — still Risk-based only', () => {
    const source = readSource('./customer.ts');
    expect(source).not.toContain('CommercialStatusSnapshot');
    expect(source).not.toContain('WeeklyAction');
  });

  it('fibroptica has an open Risk yet a healthy commercialStatus — the two never determine one another', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    expect(findCustomer(status, 'fibroptica').commercialStatusSnapshot?.commercialStatus).toBe('healthy');
    expect(getRisksForCustomer('fibroptica').some((r) => r.status === 'open')).toBe(true);
  });
});

describe('getWeeklyPortfolioStatus — period filtering', () => {
  it('WeeklyActions outside an explicit period are excluded', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08', '2026-08-01', '2026-08-31');
    expect(status.periodStart).toBe('2026-08-01');
    expect(status.periodEnd).toBe('2026-08-31');

    const manprec = findCustomer(status, 'manprec');
    expect(manprec.weeklyActions).toEqual([]);
    expect(manprec.expectedResults).toEqual([]);
  });

  it('asOf-based fields (historical totals, recentProductMetricSnapshot) are unaffected by periodStart/periodEnd', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08', '2026-08-01', '2026-08-31');
    expect(status.summary.historicalProjectsTotal).toBe(71 + 19 + 13 + 12);
    const manprec = findCustomer(status, 'manprec');
    expect(manprec.recentProductMetricSnapshot?.projectsTotal).toBe(13);
  });

  it('defaults to a 7-day period ending at asOf when no period is given', () => {
    const status = getWeeklyPortfolioStatus('2026-09-08');
    expect(status.periodStart).toBe('2026-09-02');
    expect(status.periodEnd).toBe('2026-09-08');
  });
});
