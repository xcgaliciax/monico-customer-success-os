import { getWeeklyReportContext, type WeeklyActionReview, type WeeklyCustomerChanges, type WeeklyProductActivityTotals, type WeeklyReportContext } from './weeklyReportContext';
import type { AttentionItem, CommercialAttentionItem, MissingInformationItem } from './customerIntelligenceSelectors';
import type { CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { Evidence } from '../../types/evidence';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { TemporalLimitation } from './customerContext';

export type DraftAutomationLevel = 'automatic_fact' | 'requires_interpretation' | 'requires_human_decision';

export type SourceEntityType =
  | 'customer'
  | 'product_metric_snapshot'
  | 'evidence'
  | 'risk'
  | 'weekly_action'
  | 'commercial_status_snapshot'
  | 'health_snapshot'
  | 'missing_information';

export interface SourceRef {
  entityType: SourceEntityType;
  id: string;
}

export interface DraftField<T> {
  value: T;
  automationLevel: DraftAutomationLevel;
  sourceRefs?: SourceRef[];
  caveats?: string[];
}

export interface CustomerRef {
  customerId: string;
  customerName: string;
}

export type ProductMetricAggregateCoverageStatus = 'complete' | 'subset' | 'none';

export interface ProductMetricAggregateCoverage {
  measuredCustomerCount: number;
  rosterCustomerCount: number;
  coverage: ProductMetricAggregateCoverageStatus;
}

export interface CoveredProductMetricAggregate<TTotals> {
  totals: TTotals;
  aggregateCoverage: ProductMetricAggregateCoverage;
}

export interface WeeklyHistoricalProductMetricTotals {
  projectsTotal: number;
  usersTotal: number;
}

export interface WeeklyDraftPortfolioProductMetrics {
  coverage: {
    currentRosterCustomerCount: number;
    customersWithHistoricalBaseline: number;
    customersWithActivityPeriodCoverage: number;
    customersMissingHistoricalBaseline: CustomerRef[];
    customersMissingActivityPeriodCoverage: CustomerRef[];
  };
  historicalTotals?: DraftField<CoveredProductMetricAggregate<WeeklyHistoricalProductMetricTotals>>;
  activityTotals?: DraftField<CoveredProductMetricAggregate<WeeklyProductActivityTotals>>;
}

export interface WeeklyDraftPortfolioSnapshot {
  currentRosterCustomerCount: DraftField<number>;
  productMetrics: WeeklyDraftPortfolioProductMetrics;
  dataGaps: DraftField<MissingInformationItem[]>;
}

export interface WeeklyComparisonFact {
  path: string;
  status: 'changed' | 'not_comparable';
  previous?: unknown;
  current?: unknown;
  temporalCoverage: 'as_of';
}

export interface WeeklyDraftCustomerCard {
  customerId: string;
  customerName: string;
  currentOperatingStage: DraftField<OperatingStage | undefined>;
  statusNow: {
    health: DraftField<HealthSnapshot | undefined>;
    commercial: DraftField<CommercialStatusSnapshot | undefined>;
    product: DraftField<ProductMetricSnapshot[]>;
  };
  whatChanged: {
    comparisons: WeeklyCustomerChanges;
    changedFacts: DraftField<WeeklyComparisonFact[]>;
    notComparableFacts: DraftField<WeeklyComparisonFact[]>;
  };
  activity: DraftField<ProductMetricSnapshot[]>;
  evidence: {
    currentlyCanonicalFilteredBySourceDate: DraftField<Evidence[]>;
    sourceDatedInActivityPeriod: DraftField<Evidence[]>;
    temporalCoverage: 'partial_as_of';
  };
  attention: {
    riskAttention: DraftField<AttentionItem[]>;
    commercialAttention: DraftField<CommercialAttentionItem[]>;
  };
  reviewedActions: DraftField<WeeklyActionReview[]>;
  plannedActions: DraftField<WeeklyActionReview[]>;
  expectedResultsForNextWednesday: DraftField<string[]>;
  carryForwardCandidates: DraftField<WeeklyActionReview[]>;
  dataGaps: DraftField<MissingInformationItem[]>;
  temporalLimitations: DraftField<TemporalLimitation[]>;
}

export interface WeeklyDraftHumanSections {
  executivePriorities: DraftField<undefined>;
  portfolioNarrative: DraftField<undefined>;
  customerNarratives: Array<{
    customerId: string;
    narrative: DraftField<undefined>;
    csFocus: DraftField<undefined>;
    newRecommendedActions: DraftField<undefined>;
    managementConclusion: DraftField<undefined>;
  }>;
}

export interface WeeklyStatusDraft {
  reportDate: string;
  previousAsOf: string;
  activityPeriod: WeeklyReportContext['activityPeriod'];
  previousActivityPeriod: WeeklyReportContext['previousActivityPeriod'];
  portfolioSnapshot: WeeklyDraftPortfolioSnapshot;
  customerCards: WeeklyDraftCustomerCard[];
  humanSections: WeeklyDraftHumanSections;
  temporalLimitations: WeeklyReportContext['portfolio']['temporalLimitations'];
}

function automaticFact<T>(value: T, sourceRefs?: SourceRef[], caveats?: string[]): DraftField<T> {
  return {
    value,
    automationLevel: 'automatic_fact',
    sourceRefs,
    caveats,
  };
}

function interpretationPlaceholder(): DraftField<undefined> {
  return { value: undefined, automationLevel: 'requires_interpretation' };
}

function humanDecisionPlaceholder(): DraftField<undefined> {
  return { value: undefined, automationLevel: 'requires_human_decision' };
}

function coverageStatus(measuredCustomerCount: number, rosterCustomerCount: number): ProductMetricAggregateCoverageStatus {
  if (measuredCustomerCount === 0) return 'none';
  return measuredCustomerCount === rosterCustomerCount ? 'complete' : 'subset';
}

function productMetricSourceRefs(snapshots: ProductMetricSnapshot[]): SourceRef[] {
  return snapshots.map((snapshot) => ({ entityType: 'product_metric_snapshot', id: snapshot.id }));
}

function evidenceSourceRefs(evidence: Evidence[]): SourceRef[] {
  return evidence.map((item) => ({ entityType: 'evidence', id: item.id }));
}

function weeklyActionSourceRefs(actions: WeeklyActionReview[]): SourceRef[] {
  return actions.map((review) => ({ entityType: 'weekly_action', id: review.action.id }));
}

function missingInformationSourceRefs(items: MissingInformationItem[]): SourceRef[] {
  return items.map((item) => ({ entityType: 'missing_information', id: item.id }));
}

function riskAttentionSourceRefs(items: AttentionItem[]): SourceRef[] {
  return items.map((item) => ({ entityType: 'risk', id: item.id.replace(/^attention-/, '') }));
}

function commercialAttentionSourceRefs(items: CommercialAttentionItem[]): SourceRef[] {
  return items.map((item) => ({ entityType: 'commercial_status_snapshot', id: item.id.replace(/^commercial-attention-/, '') }));
}

function aggregateCoverage(measuredCustomerCount: number, rosterCustomerCount: number): ProductMetricAggregateCoverage {
  return {
    measuredCustomerCount,
    rosterCustomerCount,
    coverage: coverageStatus(measuredCustomerCount, rosterCustomerCount),
  };
}

function buildPortfolioProductMetrics(reportContext: WeeklyReportContext): WeeklyDraftPortfolioProductMetrics {
  const rosterCustomerCount = reportContext.customers.length;
  const withHistoricalBaseline = reportContext.customers.filter((customer) => customer.current.productMetrics.latestSnapshot);
  const withActivityCoverage = reportContext.customers.filter((customer) => customer.productActivity.current.hasPeriodCoverage);

  const customersMissingHistoricalBaseline = reportContext.customers
    .filter((customer) => !customer.current.productMetrics.latestSnapshot)
    .map((customer) => ({ customerId: customer.customerId, customerName: customer.customerName }));

  const customersMissingActivityPeriodCoverage = reportContext.customers
    .filter((customer) => !customer.productActivity.current.hasPeriodCoverage)
    .map((customer) => ({ customerId: customer.customerId, customerName: customer.customerName }));

  const historicalSnapshots = withHistoricalBaseline
    .map((customer) => customer.current.productMetrics.latestSnapshot)
    .filter((snapshot): snapshot is ProductMetricSnapshot => Boolean(snapshot));

  const activitySnapshots = withActivityCoverage.flatMap((customer) => customer.productActivity.current.snapshots);

  const historicalCoverage = aggregateCoverage(historicalSnapshots.length, rosterCustomerCount);
  const activityCoverage = aggregateCoverage(withActivityCoverage.length, rosterCustomerCount);

  return {
    coverage: {
      currentRosterCustomerCount: rosterCustomerCount,
      customersWithHistoricalBaseline: historicalSnapshots.length,
      customersWithActivityPeriodCoverage: withActivityCoverage.length,
      customersMissingHistoricalBaseline,
      customersMissingActivityPeriodCoverage,
    },
    historicalTotals:
      historicalSnapshots.length > 0
        ? automaticFact(
            {
              totals: {
                projectsTotal: historicalSnapshots.reduce((sum, snapshot) => sum + snapshot.projectsTotal, 0),
                usersTotal: historicalSnapshots.reduce((sum, snapshot) => sum + snapshot.usersTotal, 0),
              },
              aggregateCoverage: historicalCoverage,
            },
            productMetricSourceRefs(historicalSnapshots),
          )
        : undefined,
    activityTotals:
      activitySnapshots.length > 0
        ? automaticFact(
            {
              totals: {
                projectsCreatedInPeriod: activitySnapshots.reduce((sum, snapshot) => sum + snapshot.projectsCreatedInWindow, 0),
                projectsCompletedInPeriod: activitySnapshots.reduce((sum, snapshot) => sum + snapshot.projectsCompletedInWindow, 0),
                projectsErroredInPeriod: activitySnapshots.reduce((sum, snapshot) => sum + snapshot.projectsErroredInWindow, 0),
                platformErrorsInPeriod: activitySnapshots.reduce((sum, snapshot) => sum + snapshot.platformErrorsInWindow, 0),
              },
              aggregateCoverage: activityCoverage,
            },
            productMetricSourceRefs(activitySnapshots),
          )
        : undefined,
  };
}

function buildPortfolioSnapshot(reportContext: WeeklyReportContext): WeeklyDraftPortfolioSnapshot {
  const dataGaps = reportContext.customers.flatMap((customer) => customer.missingInformation);

  return {
    currentRosterCustomerCount: automaticFact(reportContext.customers.length, reportContext.customers.map((customer) => ({ entityType: 'customer', id: customer.customerId }))),
    productMetrics: buildPortfolioProductMetrics(reportContext),
    dataGaps: automaticFact(dataGaps, missingInformationSourceRefs(dataGaps)),
  };
}

function flattenComparisonFacts(changes: WeeklyCustomerChanges, status: WeeklyComparisonFact['status']): WeeklyComparisonFact[] {
  const facts: WeeklyComparisonFact[] = [];

  function push(path: string, comparison: { previous?: unknown; current?: unknown; status: string; temporalCoverage: 'as_of' }) {
    if (comparison.status !== status) return;
    facts.push({
      path,
      status,
      previous: comparison.previous,
      current: comparison.current,
      temporalCoverage: comparison.temporalCoverage,
    });
  }

  push('operatingStage', changes.operatingStage);
  push('commercial.commercialStatus', changes.commercial.commercialStatus);
  push('commercial.paymentStatus', changes.commercial.paymentStatus);
  push('commercial.contractStatus', changes.commercial.contractStatus);
  push('health.finalScore', changes.health.finalScore);
  push('health.finalStatus', changes.health.finalStatus);
  push('health.trend', changes.health.trend);
  push('health.confidence', changes.health.confidence);
  push('productMetrics.platformHealth', changes.productMetrics.platformHealth);
  push('productMetrics.projectsTotal', changes.productMetrics.projectsTotal);
  push('productMetrics.usersTotal', changes.productMetrics.usersTotal);

  return facts;
}

function buildCustomerCard(customer: WeeklyReportContext['customers'][number]): WeeklyDraftCustomerCard {
  const reviewedActions = customer.actionLoop.reviewedCycle.actions;
  const plannedActions = customer.actionLoop.plannedCycle.actions;
  const carryForwardCandidates = customer.actionLoop.carryForwardCandidates;
  const expectedResults = plannedActions.map((review) => review.expectedResult);
  const currentActivitySnapshots = customer.productActivity.current.snapshots;
  const changedFacts = flattenComparisonFacts(customer.changes, 'changed');
  const notComparableFacts = flattenComparisonFacts(customer.changes, 'not_comparable');

  return {
    customerId: customer.customerId,
    customerName: customer.customerName,
    currentOperatingStage: automaticFact(customer.current.operatingStage, [{ entityType: 'customer', id: customer.customerId }]),
    statusNow: {
      health: automaticFact(
        customer.current.health,
        customer.current.health ? [{ entityType: 'health_snapshot', id: customer.current.health.id }] : undefined,
      ),
      commercial: automaticFact(
        customer.current.commercial.latestSnapshot,
        customer.current.commercial.latestSnapshot
          ? [{ entityType: 'commercial_status_snapshot', id: customer.current.commercial.latestSnapshot.id }]
          : undefined,
      ),
      product: automaticFact(currentActivitySnapshots, productMetricSourceRefs(currentActivitySnapshots)),
    },
    whatChanged: {
      comparisons: customer.changes,
      changedFacts: automaticFact(changedFacts),
      notComparableFacts: automaticFact(notComparableFacts),
    },
    activity: automaticFact(currentActivitySnapshots, productMetricSourceRefs(currentActivitySnapshots)),
    evidence: {
      currentlyCanonicalFilteredBySourceDate: automaticFact(
        customer.evidenceSignals.currentlyCanonicalFilteredBySourceDate,
        evidenceSourceRefs(customer.evidenceSignals.currentlyCanonicalFilteredBySourceDate),
        ['Evidence publication timing is partial_as_of; sourceDate is filtered but canonical publication time is not attached to Evidence records.'],
      ),
      sourceDatedInActivityPeriod: automaticFact(
        customer.evidenceSignals.sourceDatedInActivityPeriod,
        evidenceSourceRefs(customer.evidenceSignals.sourceDatedInActivityPeriod),
        ['Evidence publication timing is partial_as_of; this is source-date filtering, not newly canonical evidence.'],
      ),
      temporalCoverage: 'partial_as_of',
    },
    attention: {
      riskAttention: automaticFact(customer.attention.riskAttention, riskAttentionSourceRefs(customer.attention.riskAttention)),
      commercialAttention: automaticFact(
        customer.attention.commercialAttention,
        commercialAttentionSourceRefs(customer.attention.commercialAttention),
      ),
    },
    reviewedActions: automaticFact(reviewedActions, weeklyActionSourceRefs(reviewedActions)),
    plannedActions: automaticFact(plannedActions, weeklyActionSourceRefs(plannedActions)),
    expectedResultsForNextWednesday: automaticFact(expectedResults, weeklyActionSourceRefs(plannedActions), plannedActions.length === 0 ? ['No plannedCycle WeeklyAction exists for this customer.'] : undefined),
    carryForwardCandidates: automaticFact(carryForwardCandidates, weeklyActionSourceRefs(carryForwardCandidates), [
      'Carry-forward candidates are not automatically promoted to planned actions.',
    ]),
    dataGaps: automaticFact(customer.missingInformation, missingInformationSourceRefs(customer.missingInformation)),
    temporalLimitations: automaticFact(customer.temporalLimitations),
  };
}

function buildHumanSections(reportContext: WeeklyReportContext): WeeklyDraftHumanSections {
  return {
    executivePriorities: humanDecisionPlaceholder(),
    portfolioNarrative: interpretationPlaceholder(),
    customerNarratives: reportContext.customers.map((customer) => ({
      customerId: customer.customerId,
      narrative: interpretationPlaceholder(),
      csFocus: humanDecisionPlaceholder(),
      newRecommendedActions: humanDecisionPlaceholder(),
      managementConclusion: humanDecisionPlaceholder(),
    })),
  };
}

export function buildWeeklyStatusDraft(reportContext: WeeklyReportContext): WeeklyStatusDraft {
  return {
    reportDate: reportContext.reportDate,
    previousAsOf: reportContext.previousAsOf,
    activityPeriod: reportContext.activityPeriod,
    previousActivityPeriod: reportContext.previousActivityPeriod,
    portfolioSnapshot: buildPortfolioSnapshot(reportContext),
    customerCards: reportContext.customers.map(buildCustomerCard),
    humanSections: buildHumanSections(reportContext),
    temporalLimitations: reportContext.portfolio.temporalLimitations,
  };
}

export function getWeeklyStatusDraft(reportDate: string): WeeklyStatusDraft {
  return buildWeeklyStatusDraft(getWeeklyReportContext(reportDate));
}
