import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getCustomers } from '../../services/customerRepository';
import {
  getWeeklyReportContext,
  mapWeeklyActionOutcome,
  resolveActivityPeriod,
  resolvePreviousActivityPeriod,
  resolvePreviousAsOf,
} from './weeklyReportContext';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

function findCustomer(report: ReturnType<typeof getWeeklyReportContext>, customerId: string) {
  const found = report.customers.find((customer) => customer.customerId === customerId);
  if (!found) throw new Error(`customer ${customerId} not found in WeeklyReportContext`);
  return found;
}

describe('weekly report date helpers', () => {
  it('uses date-only Wednesday cadence with product activity ending the day before the report', () => {
    expect(resolvePreviousAsOf('2026-09-16')).toBe('2026-09-09');
    expect(resolveActivityPeriod('2026-09-16')).toEqual({ start: '2026-09-09', end: '2026-09-15' });
    expect(resolvePreviousActivityPeriod('2026-09-16')).toEqual({ start: '2026-09-02', end: '2026-09-08' });
  });

  it('selects the seeded Sep 2-8 ProductMetricSnapshot window for the Sep 9 report', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const siemens = findCustomer(report, 'siemens');

    expect(report.activityPeriod).toEqual({ start: '2026-09-02', end: '2026-09-08' });
    expect(siemens.productActivity.current.hasPeriodCoverage).toBe(true);
    expect(siemens.productActivity.current.snapshots.map((snapshot) => snapshot.id)).toEqual(['metrics-siemens-2026-09-08']);
    expect(siemens.productActivity.current.totals).toEqual({
      projectsCreatedInPeriod: 0,
      projectsCompletedInPeriod: 0,
      projectsErroredInPeriod: 0,
      platformErrorsInPeriod: 0,
    });
  });

  it('for Sep 16 uses Sep 9-15 as current activity and Sep 2-8 as previous activity', () => {
    const report = getWeeklyReportContext('2026-09-16');
    const manprec = findCustomer(report, 'manprec');

    expect(report.previousAsOf).toBe('2026-09-09');
    expect(report.activityPeriod).toEqual({ start: '2026-09-09', end: '2026-09-15' });
    expect(report.previousActivityPeriod).toEqual({ start: '2026-09-02', end: '2026-09-08' });
    expect(manprec.productActivity.current.hasPeriodCoverage).toBe(false);
    expect(manprec.productActivity.current.totals).toBeUndefined();
    expect(manprec.productActivity.previous.hasPeriodCoverage).toBe(true);
    expect(manprec.productActivity.previous.snapshots.map((snapshot) => snapshot.id)).toEqual(['metrics-manprec-2026-09-08']);
  });
});

describe('weekly report ProductMetric coverage', () => {
  it('keeps historical baseline and current period coverage distinct', () => {
    const report = getWeeklyReportContext('2026-09-16');
    const siemens = findCustomer(report, 'siemens');

    expect(siemens.productActivity.current.hasHistoricalBaseline).toBe(true);
    expect(siemens.productActivity.current.hasPeriodCoverage).toBe(false);
    expect(siemens.missingInformation).toContainEqual(
      expect.objectContaining({
        field: 'periodCoverage',
        periodStart: '2026-09-09',
        periodEnd: '2026-09-15',
      }),
    );
  });

  it('does not interpret missing period coverage as observed zero activity', () => {
    const report = getWeeklyReportContext('2026-09-16');
    const grupoBalle = findCustomer(report, 'grupo-balle');

    expect(grupoBalle.productActivity.current.hasPeriodCoverage).toBe(false);
    expect(grupoBalle.productActivity.current.totals).toBeUndefined();
    expect(grupoBalle.productActivity.current.snapshots).toEqual([]);
  });

  it('keeps explicit zero counters as observed zero when period coverage exists', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const siemens = findCustomer(report, 'siemens');

    expect(siemens.productActivity.current.hasPeriodCoverage).toBe(true);
    expect(siemens.productActivity.current.totals?.projectsCreatedInPeriod).toBe(0);
    expect(siemens.productActivity.current.totals?.projectsCompletedInPeriod).toBe(0);
    expect(siemens.productActivity.current.totals?.projectsErroredInPeriod).toBe(0);
  });

  it('keeps ASCH valid with no invented Product Metrics or Health', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const asch = findCustomer(report, 'asch');

    expect(asch.productActivity.current.hasHistoricalBaseline).toBe(false);
    expect(asch.productActivity.current.hasPeriodCoverage).toBe(false);
    expect(asch.productActivity.current.totals).toBeUndefined();
    expect(asch.current.productMetrics.latestSnapshot).toBeUndefined();
    expect(asch.current.health).toBeUndefined();
    expect(asch.missingInformation).toContainEqual(expect.objectContaining({ field: 'productMetricSnapshot' }));
    expect(asch.missingInformation).toContainEqual(expect.objectContaining({ field: 'healthSnapshot' }));
  });
});

describe('weekly report action loop', () => {
  it('selects reviewed actions for Sep 9 from weekOf Sep 2', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const manprec = findCustomer(report, 'manprec');

    expect(manprec.actionLoop.reviewedCycle.weekOf).toBe('2026-09-02');
    expect(manprec.actionLoop.reviewedCycle.actions.map((review) => review.action.id)).toEqual(['wa-manprec-first-invoice']);
  });

  it('selects planned actions for Sep 9 from weekOf Sep 9 only', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const manprec = findCustomer(report, 'manprec');

    expect(manprec.actionLoop.plannedCycle.weekOf).toBe('2026-09-09');
    expect(manprec.actionLoop.plannedCycle.actions.map((review) => review.action.id)).toEqual([
      'wa-manprec-technical-rerun-2026-09-09',
      'wa-manprec-manual-time-baseline-2026-09-09',
      'wa-manprec-payment-commitment-2026-09-09',
    ]);
  });

  it('maps WeeklyActionStatus to deterministic outcomes without prose inference', () => {
    expect(mapWeeklyActionOutcome('planned')).toBe('unresolved');
    expect(mapWeeklyActionOutcome('partial')).toBe('partial');
    expect(mapWeeklyActionOutcome('not_achieved')).toBe('not_achieved');
    expect(mapWeeklyActionOutcome('achieved')).toBe('achieved');
    expect(mapWeeklyActionOutcome('cancelled')).toBe('not_evaluable');
  });

  it('carryForwardCandidates only come from reviewed actions and never become planned actions automatically', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const siemens = findCustomer(report, 'siemens');
    const fibroptica = findCustomer(report, 'fibroptica');
    const grupoBalle = findCustomer(report, 'grupo-balle');

    expect(siemens.actionLoop.carryForwardCandidates.map((review) => review.action.id)).toEqual(['wa-siemens-confirm-payment-date']);
    expect(siemens.actionLoop.plannedCycle.actions.map((review) => review.action.id)).toEqual([
      'wa-siemens-lam-followup-2026-09-09',
      'wa-siemens-procurement-connectors-2026-09-09',
    ]);
    expect(fibroptica.actionLoop.carryForwardCandidates.map((review) => review.action.id)).toEqual([
      'wa-fibroptica-role-activation-followup',
    ]);
    expect(fibroptica.actionLoop.plannedCycle.actions.map((review) => review.action.id)).toEqual([
      'wa-fibroptica-reschedule-session-2026-09-09',
      'wa-fibroptica-contract-nda-review-2026-09-09',
      'wa-fibroptica-value-validation-2026-09-09',
    ]);
    expect(grupoBalle.actionLoop.carryForwardCandidates).toEqual([]);
  });
});

describe('weekly report temporal governance', () => {
  it('marks Evidence as partial_as_of without calling it newly canonical', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const manprec = findCustomer(report, 'manprec');

    expect(manprec.evidenceSignals.temporalCoverage).toBe('partial_as_of');
    expect(manprec.evidenceSignals.currentlyCanonicalFilteredBySourceDate.every((item) => item.sourceDate <= '2026-09-09')).toBe(true);
    expect(manprec.evidenceSignals).not.toHaveProperty('newlyCanonical');
    expect(manprec.evidenceSignals).not.toHaveProperty('availableAsOf');
  });

  it('does not expose historical diffs for Risks, Commitments, or NextActions', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const fibroptica = findCustomer(report, 'fibroptica');

    expect(fibroptica.changes).not.toHaveProperty('risks');
    expect(fibroptica.changes).not.toHaveProperty('commitments');
    expect(fibroptica.changes).not.toHaveProperty('nextActions');
    expect(fibroptica.temporalCoverage.risks).toBe('current_state_only');
    expect(fibroptica.temporalCoverage.commitments).toBe('current_state_only');
    expect(fibroptica.temporalCoverage.nextActions).toBe('current_state_only');
  });

  it('does not infer customer roster changes in portfolio context', () => {
    const report = getWeeklyReportContext('2026-09-09');

    expect(report.portfolio.current.summary.customerCount).toBe(getCustomers().length);
    expect(report.portfolio.previous.summary.customerCount).toBe(getCustomers().length);
    expect(report.portfolio).not.toHaveProperty('customersAdded');
    expect(report.portfolio).not.toHaveProperty('customersRemoved');
    expect(report.portfolio).not.toHaveProperty('customerCountChange');
    expect(report.portfolio.temporalLimitations).toContainEqual(
      expect.objectContaining({
        field: 'roster',
      }),
    );
  });

  it('uses not_comparable when a previous reliable baseline does not exist', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const asch = findCustomer(report, 'asch');

    expect(asch.previous.operatingStage).toBeUndefined();
    expect(asch.current.operatingStage).toBe('ready');
    expect(asch.changes.operatingStage.status).toBe('not_comparable');
    expect(asch.changes.commercial.commercialStatus.status).toBe('not_comparable');
    expect(asch.changes.health.finalScore.status).toBe('not_comparable');
    expect(asch.changes.productMetrics.platformHealth.status).toBe('not_comparable');
  });

  it('does not import or alter Health engine behavior', () => {
    expect(readSource('./weeklyReportContext.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
    expect(readSource('../healthEngine.ts')).not.toContain('WeeklyReportContext');
  });
});

describe('weekly report synthetic product activity helper expectations', () => {
  it('keeps period snapshots as full ProductMetricSnapshot records', () => {
    const report = getWeeklyReportContext('2026-09-09');
    const snapshot: ProductMetricSnapshot | undefined = findCustomer(report, 'grupo-balle').productActivity.current.snapshots[0];

    expect(snapshot?.windowStart).toBe('2026-09-02');
    expect(snapshot?.windowEnd).toBe('2026-09-08');
    expect(snapshot?.projectsCreatedInWindow).toBe(2);
  });
});
