import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getWeeklyReportContext } from './weeklyReportContext';
import { buildWeeklyStatusDraft, getWeeklyStatusDraft } from './weeklyStatusDraft';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

function findCustomer(draft: ReturnType<typeof getWeeklyStatusDraft>, customerId: string) {
  const found = draft.customerCards.find((customer) => customer.customerId === customerId);
  if (!found) throw new Error(`customer ${customerId} not found in WeeklyStatusDraft`);
  return found;
}

describe('WeeklyStatusDraft — Sep 9 portfolio ProductMetric coverage', () => {
  it('exposes roster, historical baseline coverage, activity-period coverage, and separate aggregate totals', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const productMetrics = draft.portfolioSnapshot.productMetrics;

    expect(draft.portfolioSnapshot.currentRosterCustomerCount.value).toBe(5);
    expect(productMetrics.coverage.currentRosterCustomerCount).toBe(5);
    expect(productMetrics.coverage.customersWithHistoricalBaseline).toBe(4);
    expect(productMetrics.coverage.customersWithActivityPeriodCoverage).toBe(4);
    expect(productMetrics.coverage.customersMissingHistoricalBaseline).toEqual([{ customerId: 'asch', customerName: 'ASCH' }]);
    expect(productMetrics.coverage.customersMissingActivityPeriodCoverage).toEqual([{ customerId: 'asch', customerName: 'ASCH' }]);

    expect(productMetrics.historicalTotals?.value).toEqual({
      totals: {
        projectsTotal: 115,
        usersTotal: 55,
      },
      aggregateCoverage: {
        measuredCustomerCount: 4,
        rosterCustomerCount: 5,
        coverage: 'subset',
      },
    });

    expect(productMetrics.activityTotals?.value).toEqual({
      totals: {
        projectsCreatedInPeriod: 7,
        projectsCompletedInPeriod: 5,
        projectsErroredInPeriod: 2,
        platformErrorsInPeriod: 3,
      },
      aggregateCoverage: {
        measuredCustomerCount: 4,
        rosterCustomerCount: 5,
        coverage: 'subset',
      },
    });
  });

  it('does not let ASCH contribute zero or invented ProductMetric values to aggregate source refs', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const historicalRefs = draft.portfolioSnapshot.productMetrics.historicalTotals?.sourceRefs?.map((ref) => ref.id).sort();
    const activityRefs = draft.portfolioSnapshot.productMetrics.activityTotals?.sourceRefs?.map((ref) => ref.id).sort();

    expect(historicalRefs).toEqual([
      'metrics-fibroptica-2026-09-08',
      'metrics-grupo-balle-2026-09-08',
      'metrics-manprec-2026-09-08',
      'metrics-siemens-2026-09-08',
    ]);
    expect(activityRefs).toEqual(historicalRefs);
    expect(historicalRefs?.some((id) => id.includes('asch'))).toBe(false);
  });
});

describe('WeeklyStatusDraft — Sep 9 customer facts', () => {
  it('maps Manprec deterministic facts without inventing planned expected results', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const manprec = findCustomer(draft, 'manprec');

    expect(manprec.activity.value[0]).toMatchObject({
      id: 'metrics-manprec-2026-09-08',
      projectsCreatedInWindow: 3,
      projectsCompletedInWindow: 1,
      projectsErroredInWindow: 2,
    });
    expect(manprec.statusNow.commercial.value?.id).toBe('commercial-manprec-2026-09-09');
    expect(manprec.statusNow.commercial.value?.commercialStatus).toBe('attention');
    expect(manprec.attention.riskAttention.value.map((item) => item.id)).toEqual([
      'attention-risk-manprec-technical-workflow-completion',
    ]);
    expect(manprec.attention.commercialAttention.value.map((item) => item.id)).toEqual([
      'commercial-attention-commercial-manprec-2026-09-09',
    ]);
    expect(manprec.reviewedActions.value.map((review) => ({ id: review.action.id, outcome: review.outcome }))).toEqual([
      { id: 'wa-manprec-first-invoice', outcome: 'partial' },
    ]);
    expect(manprec.plannedActions.value.map((review) => review.action.id)).toEqual([
      'wa-manprec-technical-rerun-2026-09-09',
      'wa-manprec-manual-time-baseline-2026-09-09',
      'wa-manprec-payment-commitment-2026-09-09',
    ]);
    expect(manprec.expectedResultsForNextWednesday.value).toEqual([
      'Rerun exitoso.',
      'Baseline de tiempo manual.',
      'Compromiso explícito de pago / fecha.',
    ]);
  });

  it('maps Grupo Balle activity facts', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const grupoBalle = findCustomer(draft, 'grupo-balle');

    expect(grupoBalle.activity.value[0]).toMatchObject({
      id: 'metrics-grupo-balle-2026-09-08',
      projectsCreatedInWindow: 2,
      projectsCompletedInWindow: 2,
      projectsErroredInWindow: 0,
    });
  });

  it('preserves Siemens observed zero activity without fabricating a Risk', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const siemens = findCustomer(draft, 'siemens');

    expect(siemens.activity.value[0]).toMatchObject({
      id: 'metrics-siemens-2026-09-08',
      projectsCreatedInWindow: 0,
      projectsCompletedInWindow: 0,
      projectsErroredInWindow: 0,
    });
    expect(siemens.attention.riskAttention.value.map((item) => item.id)).toEqual(['attention-risk-siemens-regulatory-doc-approval']);
  });

  it('keeps ASCH as a roster account with no invented Product Metrics or Health', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const asch = findCustomer(draft, 'asch');

    expect(asch.currentOperatingStage.value).toBe('ready');
    expect(asch.statusNow.commercial.value?.commercialStatus).toBe('pre_contract');
    expect(asch.statusNow.commercial.value?.id).toBe('commercial-asch-2026-09-09');
    expect(asch.statusNow.health.value).toBeUndefined();
    expect(asch.activity.value).toEqual([]);
    expect(asch.statusNow.product.value).toEqual([]);
    expect(asch.dataGaps.value).toContainEqual(expect.objectContaining({ field: 'productMetricSnapshot' }));
    expect(asch.dataGaps.value).toContainEqual(expect.objectContaining({ field: 'healthSnapshot' }));
  });
});

describe('WeeklyStatusDraft — comparison and evidence governance', () => {
  it('filters changedFacts and notComparableFacts without duplicating the full comparison object', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const asch = findCustomer(draft, 'asch');

    expect(asch.whatChanged.comparisons).toHaveProperty('operatingStage');
    expect(asch.whatChanged.changedFacts.value.every((fact) => fact.status === 'changed')).toBe(true);
    expect(asch.whatChanged.notComparableFacts.value.every((fact) => fact.status === 'not_comparable')).toBe(true);
    expect(asch.whatChanged.changedFacts.value.find((fact) => fact.path === 'operatingStage')).toBeUndefined();
    expect(asch.whatChanged.notComparableFacts.value).toContainEqual(
      expect.objectContaining({
        path: 'operatingStage',
        status: 'not_comparable',
        current: 'ready',
      }),
    );
  });

  it('keeps Evidence partial_as_of and avoids historically overclaiming names', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const manprec = findCustomer(draft, 'manprec');

    expect(manprec.evidence.temporalCoverage).toBe('partial_as_of');
    expect(manprec.evidence.currentlyCanonicalFilteredBySourceDate.automationLevel).toBe('automatic_fact');
    expect(manprec.evidence.sourceDatedInActivityPeriod.automationLevel).toBe('automatic_fact');
    expect(manprec.evidence).not.toHaveProperty('availableAsOf');
    expect(manprec.evidence).not.toHaveProperty('newlyCanonical');
  });
});

describe('WeeklyStatusDraft — actions and human sections', () => {
  it('keeps reviewed/planned/carry-forward actions separate', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const fibroptica = findCustomer(draft, 'fibroptica');

    expect(fibroptica.reviewedActions.value.map((review) => review.action.id)).toEqual(['wa-fibroptica-role-activation-followup']);
    expect(fibroptica.carryForwardCandidates.value.map((review) => review.action.id)).toEqual([
      'wa-fibroptica-role-activation-followup',
    ]);
    expect(fibroptica.plannedActions.value.map((review) => review.action.id)).toEqual([
      'wa-fibroptica-reschedule-session-2026-09-09',
      'wa-fibroptica-contract-nda-review-2026-09-09',
      'wa-fibroptica-value-validation-2026-09-09',
    ]);
    expect(fibroptica.expectedResultsForNextWednesday.value).toEqual([
      'Fecha de reunión confirmada.',
      'Ruta de respuesta legal definida.',
      'Al menos una declaración explícita reciente de resultado/valor.',
    ]);
  });

  it('leaves interpretation and human-decision placeholders unfilled with correct automation levels', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const manprecHuman = draft.humanSections.customerNarratives.find((section) => section.customerId === 'manprec');

    expect(draft.humanSections.portfolioNarrative).toEqual({ value: undefined, automationLevel: 'requires_interpretation' });
    expect(draft.humanSections.executivePriorities).toEqual({ value: undefined, automationLevel: 'requires_human_decision' });
    expect(manprecHuman?.narrative).toEqual({ value: undefined, automationLevel: 'requires_interpretation' });
    expect(manprecHuman?.csFocus).toEqual({ value: undefined, automationLevel: 'requires_human_decision' });
    expect(manprecHuman?.newRecommendedActions).toEqual({ value: undefined, automationLevel: 'requires_human_decision' });
    expect(manprecHuman?.managementConclusion).toEqual({ value: undefined, automationLevel: 'requires_human_decision' });
  });
});

describe('WeeklyStatusDraft — traceability', () => {
  it('uses concrete source refs for aggregate metrics and no synthetic report/context refs', () => {
    const draft = getWeeklyStatusDraft('2026-09-09');
    const refs = [
      ...(draft.portfolioSnapshot.productMetrics.historicalTotals?.sourceRefs ?? []),
      ...(draft.portfolioSnapshot.productMetrics.activityTotals?.sourceRefs ?? []),
    ];

    expect(refs.length).toBeGreaterThan(0);
    expect(refs.every((ref) => ref.entityType === 'product_metric_snapshot')).toBe(true);
    expect(refs.map((ref) => ref.entityType)).not.toContain('weekly_report_context');
    expect(refs.map((ref) => ref.entityType)).not.toContain('customer_context');
  });

  it('retains customer-card source refs for source entities', () => {
    const draft = buildWeeklyStatusDraft(getWeeklyReportContext('2026-09-09'));
    const manprec = findCustomer(draft, 'manprec');

    expect(manprec.activity.sourceRefs).toEqual([{ entityType: 'product_metric_snapshot', id: 'metrics-manprec-2026-09-08' }]);
    expect(manprec.statusNow.commercial.sourceRefs).toEqual([
      { entityType: 'commercial_status_snapshot', id: 'commercial-manprec-2026-09-09' },
    ]);
    expect(manprec.reviewedActions.sourceRefs).toEqual([{ entityType: 'weekly_action', id: 'wa-manprec-first-invoice' }]);
  });

  it('does not import or alter the Health engine', () => {
    expect(readSource('./weeklyStatusDraft.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
    expect(readSource('../healthEngine.ts')).not.toContain('WeeklyStatusDraft');
  });
});
