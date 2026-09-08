import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  getCommitmentsForCustomer,
  getLatestHealthSnapshot,
  getNextActionsForCustomer,
  getRisksForCustomer,
} from '../../services/customerRepository';
import { resolveHealthSnapshot } from '../healthEngine';
import { getCustomerIntelligence } from './customer';
import {
  describeHealthChanges,
  describeMetricChanges,
  getPreWeeklyScorecard,
  latestAtOrBefore,
  previousOf,
} from './preWeeklyScorecard';
import type { HealthSnapshotInput } from '../../types/healthSnapshot';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

const REAL_CUSTOMER_IDS = ['siemens', 'grupo-balle', 'manprec', 'fibroptica'];

describe('getPreWeeklyScorecard — unknown customer', () => {
  it('returns undefined', () => {
    expect(getPreWeeklyScorecard('unknown-customer', '2026-09-08')).toBeUndefined();
  });
});

describe('getPreWeeklyScorecard — real accounts as of 2026-09-08', () => {
  it('returns customerName, operatingStage and csHealth matching the repository directly', () => {
    const siemens = getPreWeeklyScorecard('siemens', '2026-09-08')!;
    expect(siemens.customerName).toBe('Siemens');
    expect(siemens.operatingStage).toBe('operating');
    const directHealth = getLatestHealthSnapshot('siemens')!;
    expect(siemens.csHealth).toEqual({
      score: directHealth.finalScore,
      status: directHealth.finalStatus,
      trend: directHealth.trend,
      confidence: directHealth.confidence,
    });
  });

  it('returns platformHealth and activity from the seeded ProductMetricSnapshot', () => {
    const manprec = getPreWeeklyScorecard('manprec', '2026-09-08')!;
    expect(manprec.platformHealth).toBe(86);
    expect(manprec.activity).toEqual({
      windowStart: '2026-09-02',
      windowEnd: '2026-09-08',
      projectsCreatedInWindow: 3,
      projectsCompletedInWindow: 1,
      projectsErroredInWindow: 2,
      platformErrorsInWindow: 3,
      avgAnalysisSeconds: 349,
    });
  });

  it('whatChanged is empty for every real account — no prior metric/health snapshot exists yet', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      expect(getPreWeeklyScorecard(customerId, '2026-09-08')!.whatChanged).toEqual([]);
    }
  });

  it('watchItems/positiveSignals are exactly what getCustomerIntelligence returns — no parallel derivation', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      const scorecard = getPreWeeklyScorecard(customerId, '2026-09-08')!;
      const intelligence = getCustomerIntelligence(customerId)!;
      expect(scorecard.watchItems).toEqual(intelligence.attentionItems);
      expect(scorecard.positiveSignals).toEqual(intelligence.opportunityItems);
    }
  });

  it('openBlockers includes only status "open" risks (excludes monitoring/resolved)', () => {
    // Siemens' only Risk is status "monitoring" — not an open blocker.
    expect(getPreWeeklyScorecard('siemens', '2026-09-08')!.openBlockers).toEqual([]);
    // Grupo Balle and Fibroptica each have exactly one status "open" Risk.
    expect(getPreWeeklyScorecard('grupo-balle', '2026-09-08')!.openBlockers).toEqual(
      getRisksForCustomer('grupo-balle').filter((risk) => risk.status === 'open'),
    );
    expect(getPreWeeklyScorecard('fibroptica', '2026-09-08')!.openBlockers).toHaveLength(1);
    // Manprec has no seeded Risk at all.
    expect(getPreWeeklyScorecard('manprec', '2026-09-08')!.openBlockers).toEqual([]);
  });

  it('openCommitments excludes status "done" — currently empty for every account (no Commitment seed data yet)', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      expect(getPreWeeklyScorecard(customerId, '2026-09-08')!.openCommitments).toEqual(
        getCommitmentsForCustomer(customerId).filter((c) => c.status !== 'done'),
      );
    }
  });

  it('csRecommendation reuses the existing summary NextAction exactly', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      const scorecard = getPreWeeklyScorecard(customerId, '2026-09-08')!;
      expect(scorecard.csRecommendation).toEqual(getNextActionsForCustomer(customerId, 'summary')[0]);
    }
  });

  it('meetingObjective and bestQuestion are undefined — never fabricated in this slice', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      const scorecard = getPreWeeklyScorecard(customerId, '2026-09-08')!;
      expect(scorecard.meetingObjective).toBeUndefined();
      expect(scorecard.bestQuestion).toBeUndefined();
    }
  });

  it('evidenceFreshness reflects the most recent real Evidence.sourceDate', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      const scorecard = getPreWeeklyScorecard(customerId, '2026-09-08')!;
      expect(scorecard.evidenceFreshness.mostRecentEvidenceDate).toBe('2026-09-01');
      expect(scorecard.evidenceFreshness.daysSinceLastEvidence).toBe(7);
      expect(scorecard.evidenceFreshness.mostRecentProductMetricDate).toBe('2026-09-08');
    }
  });
});

describe('getPreWeeklyScorecard — asOf filtering (real seed data, no fabrication)', () => {
  it('omits platformHealth/activity when asOf predates the only ProductMetricSnapshot window', () => {
    const scorecard = getPreWeeklyScorecard('siemens', '2026-09-01')!;
    expect(scorecard.platformHealth).toBeUndefined();
    expect(scorecard.activity).toBeUndefined();
    // The HealthSnapshot IS dated 2026-09-01, so csHealth is still present.
    expect(scorecard.csHealth).toBeDefined();
  });

  it('omits csHealth when asOf predates the only HealthSnapshot', () => {
    const scorecard = getPreWeeklyScorecard('siemens', '2026-08-01')!;
    expect(scorecard.csHealth).toBeUndefined();
    expect(scorecard.platformHealth).toBeUndefined();
  });

  it('omits operatingStage when asOf predates the confirmed stage snapshot date', () => {
    const scorecard = getPreWeeklyScorecard('siemens', '2026-09-07')!;
    expect(scorecard.operatingStage).toBeUndefined();
  });

  it('includes operatingStage once asOf reaches the confirmed snapshot date', () => {
    const scorecard = getPreWeeklyScorecard('siemens', '2026-09-08')!;
    expect(scorecard.operatingStage).toBe('operating');
  });
});

describe('latestAtOrBefore / previousOf — synthetic history fixtures', () => {
  const items = [{ date: '2026-08-01' }, { date: '2026-08-15' }, { date: '2026-09-01' }];
  const dateOf = (item: { date: string }) => item.date;

  it('picks the latest item at or before asOf', () => {
    expect(latestAtOrBefore(items, '2026-08-20', dateOf)).toEqual({ date: '2026-08-15' });
    expect(latestAtOrBefore(items, '2026-09-01', dateOf)).toEqual({ date: '2026-09-01' });
    expect(latestAtOrBefore(items, '2026-01-01', dateOf)).toBeUndefined();
  });

  it('picks the item immediately before the latest-at-or-before item', () => {
    expect(previousOf(items, '2026-09-01', dateOf)).toEqual({ date: '2026-08-15' });
    expect(previousOf(items, '2026-08-15', dateOf)).toEqual({ date: '2026-08-01' });
    expect(previousOf(items, '2026-08-01', dateOf)).toBeUndefined();
  });

  it('returns undefined for an empty history', () => {
    expect(latestAtOrBefore([], '2026-09-01', dateOf)).toBeUndefined();
    expect(previousOf([], '2026-09-01', dateOf)).toBeUndefined();
  });
});

describe('describeMetricChanges — synthetic two-snapshot comparison', () => {
  const previous: ProductMetricSnapshot = {
    id: 'synthetic-prev',
    customerId: 'synthetic',
    snapshotDate: '2026-09-01',
    windowStart: '2026-08-26',
    windowEnd: '2026-09-01',
    projectsTotal: 10,
    usersTotal: 5,
    projectsCreatedInWindow: 1,
    projectsCompletedInWindow: 1,
    projectsErroredInWindow: 0,
    platformHealth: 90,
    avgAnalysisSeconds: 100,
    llmTokensInWindow: 1000,
    platformErrorsInWindow: 0,
    source: 'manual_entry',
  };
  const current: ProductMetricSnapshot = {
    ...previous,
    id: 'synthetic-current',
    snapshotDate: '2026-09-08',
    windowStart: '2026-09-02',
    windowEnd: '2026-09-08',
    projectsCreatedInWindow: 4,
    projectsCompletedInWindow: 3,
    projectsErroredInWindow: 1,
    platformHealth: 82,
    platformErrorsInWindow: 2,
  };

  it('returns no deltas when there is no previous snapshot', () => {
    expect(describeMetricChanges(current, undefined)).toEqual([]);
  });

  it('describes every changed field as a factual "before → after" line', () => {
    const lines = describeMetricChanges(current, previous);
    expect(lines).toContain('Proyectos creados: 1 → 4');
    expect(lines).toContain('Proyectos completados: 1 → 3');
    expect(lines).toContain('Proyectos con error: 0 → 1');
    expect(lines).toContain('Errores de plataforma: 0 → 2');
    expect(lines).toContain('Salud de plataforma: 90 → 82');
  });

  it('omits unchanged fields', () => {
    const unchanged = describeMetricChanges(previous, previous);
    expect(unchanged).toEqual([]);
  });
});

describe('describeHealthChanges — synthetic two-snapshot comparison', () => {
  const baseInput: HealthSnapshotInput = {
    id: 'synthetic-health-prev',
    customerId: 'synthetic',
    snapshotDate: '2026-09-01',
    dimensions: { valueProgress: 80, workflowAdoption: 80, championEngagement: 80, requiredRoleActivation: 80, executionRisk: 80 },
    trend: 'stable',
    confidence: 'medium',
    lifecycle: 'adoption',
    approved: true,
  };
  const previous = resolveHealthSnapshot(baseInput);
  const current = resolveHealthSnapshot({
    ...baseInput,
    id: 'synthetic-health-current',
    snapshotDate: '2026-09-08',
    dimensions: { valueProgress: 95, workflowAdoption: 95, championEngagement: 95, requiredRoleActivation: 95, executionRisk: 95 },
    trend: 'improving',
  });

  it('returns no deltas when there is no previous snapshot', () => {
    expect(describeHealthChanges(current, undefined)).toEqual([]);
  });

  it('describes a score and trend change', () => {
    const lines = describeHealthChanges(current, previous);
    expect(lines).toContain(`Health Score: ${previous.finalScore} → ${current.finalScore}`);
    expect(lines).toContain('Tendencia: stable → improving');
  });

  it('omits unchanged fields', () => {
    expect(describeHealthChanges(previous, previous)).toEqual([]);
  });
});

describe('ProductMetricSnapshot / HealthScore separation (regression)', () => {
  it('healthEngine.ts never references ProductMetricSnapshot', () => {
    expect(readSource('../healthEngine.ts')).not.toContain('ProductMetricSnapshot');
  });

  it('customerUpdateService.ts never references ProductMetricSnapshot', () => {
    expect(readSource('../../services/customerUpdateService.ts')).not.toContain('ProductMetricSnapshot');
  });

  it('platformHealth and csHealth are computed from independent sources and differ for every seeded account', () => {
    for (const customerId of REAL_CUSTOMER_IDS) {
      const scorecard = getPreWeeklyScorecard(customerId, '2026-09-08')!;
      const directHealth = getLatestHealthSnapshot(customerId)!;
      expect(scorecard.csHealth?.score).toBe(directHealth.finalScore);
      expect(scorecard.platformHealth).not.toBe(scorecard.csHealth?.score);
    }
  });
});
