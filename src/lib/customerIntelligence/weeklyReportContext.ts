import { getCustomers, getProductMetricSnapshotsForCustomer } from '../../services/customerRepository';
import {
  canonicalizeProductMetricSnapshotsAsOf,
  selectPeriodSnapshots,
  type CommercialAttentionItem,
  type AttentionItem,
  type MissingInformationItem,
} from './customerIntelligenceSelectors';
import { getCustomerContext, type CustomerContext, type TemporalCoverage } from './customerContext';
import { getWeeklyPortfolioStatus, type WeeklyPortfolioStatus } from './weeklyPortfolioStatus';
import type { CommercialStanding } from '../../types/commercialStatusSnapshot';
import type { Confidence, HealthStatus, Trend } from '../../types/health';
import type { Evidence } from '../../types/evidence';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { WeeklyAction, WeeklyActionStatus } from '../../types/weeklyAction';

export interface WeeklyActivityPeriod {
  start: string;
  end: string;
}

export interface WeeklyReportTemporalLimitation {
  field: string;
  reason: string;
}

export interface WeeklyReportPortfolioContext {
  current: WeeklyPortfolioStatus;
  previous: WeeklyPortfolioStatus;
  temporalCoverage: {
    roster: 'current_state';
    metrics: 'as_of';
    activity: 'as_of';
  };
  temporalLimitations: WeeklyReportTemporalLimitation[];
}

export type ComparisonStatus = 'changed' | 'unchanged' | 'not_comparable';

export interface ComparedValue<T> {
  previous?: T;
  current?: T;
  status: ComparisonStatus;
  temporalCoverage: 'as_of';
}

export interface WeeklyCustomerChanges {
  operatingStage: ComparedValue<OperatingStage>;
  commercial: {
    commercialStatus: ComparedValue<CommercialStanding>;
    paymentStatus: ComparedValue<string>;
    contractStatus: ComparedValue<string>;
  };
  health: {
    finalScore: ComparedValue<number>;
    finalStatus: ComparedValue<HealthStatus>;
    trend: ComparedValue<Trend>;
    confidence: ComparedValue<Confidence>;
  };
  productMetrics: {
    platformHealth: ComparedValue<number>;
    projectsTotal: ComparedValue<number>;
    usersTotal: ComparedValue<number>;
  };
}

export interface WeeklyProductActivityTotals {
  projectsCreatedInPeriod: number;
  projectsCompletedInPeriod: number;
  projectsErroredInPeriod: number;
  platformErrorsInPeriod: number;
}

export interface WeeklyProductActivityPeriodContext {
  period: WeeklyActivityPeriod;
  snapshots: ProductMetricSnapshot[];
  hasHistoricalBaseline: boolean;
  hasPeriodCoverage: boolean;
  totals?: WeeklyProductActivityTotals;
}

export interface WeeklyProductActivity {
  current: WeeklyProductActivityPeriodContext;
  previous: WeeklyProductActivityPeriodContext;
}

export interface WeeklyEvidenceSignals {
  currentlyCanonicalFilteredBySourceDate: Evidence[];
  sourceDatedInActivityPeriod: Evidence[];
  temporalCoverage: Extract<TemporalCoverage, 'partial_as_of'>;
}

export interface WeeklyAttentionContext {
  riskAttention: AttentionItem[];
  commercialAttention: CommercialAttentionItem[];
  temporalCoverage: {
    riskAttention: 'current_state_only';
    commercialAttention: 'as_of';
  };
}

export type WeeklyActionOutcome = 'achieved' | 'partial' | 'not_achieved' | 'unresolved' | 'not_evaluable';

export interface WeeklyActionReview {
  action: WeeklyAction;
  expectedResult: string;
  status: WeeklyActionStatus;
  outcome: WeeklyActionOutcome;
  actualResult?: string;
  resultNote?: string;
}

export interface WeeklyActionCycle {
  weekOf: string;
  actions: WeeklyActionReview[];
}

export interface WeeklyActionLoop {
  reviewedCycle: WeeklyActionCycle;
  plannedCycle: WeeklyActionCycle;
  carryForwardCandidates: WeeklyActionReview[];
}

export interface WeeklyReportCustomerContext {
  customerId: string;
  customerName: string;
  current: CustomerContext;
  previous: CustomerContext;
  activityPeriod: WeeklyActivityPeriod;
  previousActivityPeriod: WeeklyActivityPeriod;
  changes: WeeklyCustomerChanges;
  productActivity: WeeklyProductActivity;
  evidenceSignals: WeeklyEvidenceSignals;
  attention: WeeklyAttentionContext;
  actionLoop: WeeklyActionLoop;
  temporalCoverage: CustomerContext['temporalCoverage'];
  temporalLimitations: CustomerContext['temporalLimitations'];
  missingInformation: MissingInformationItem[];
}

export interface WeeklyReportContext {
  reportDate: string;
  previousAsOf: string;
  activityPeriod: WeeklyActivityPeriod;
  previousActivityPeriod: WeeklyActivityPeriod;
  portfolio: WeeklyReportPortfolioContext;
  customers: WeeklyReportCustomerContext[];
}

const PORTFOLIO_TEMPORAL_LIMITATIONS: WeeklyReportTemporalLimitation[] = [
  {
    field: 'roster',
    reason:
      'Customer roster membership is current-state metadata; historical additions/removals cannot be reconstructed reliably.',
  },
];

function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function resolvePreviousAsOf(reportDate: string): string {
  return addDays(reportDate, -7);
}

export function resolveActivityPeriod(reportDate: string): WeeklyActivityPeriod {
  return {
    start: addDays(reportDate, -7),
    end: addDays(reportDate, -1),
  };
}

export function resolvePreviousActivityPeriod(reportDate: string): WeeklyActivityPeriod {
  return {
    start: addDays(reportDate, -14),
    end: addDays(reportDate, -8),
  };
}

function compareValue<T>(previous: T | undefined, current: T | undefined): ComparedValue<T> {
  if (previous === undefined || current === undefined) {
    return { previous, current, status: 'not_comparable', temporalCoverage: 'as_of' };
  }
  return {
    previous,
    current,
    status: Object.is(previous, current) ? 'unchanged' : 'changed',
    temporalCoverage: 'as_of',
  };
}

function buildChanges(previous: CustomerContext, current: CustomerContext): WeeklyCustomerChanges {
  const previousCommercial = previous.commercial.latestSnapshot;
  const currentCommercial = current.commercial.latestSnapshot;
  const previousHealth = previous.health;
  const currentHealth = current.health;
  const previousMetrics = previous.productMetrics.latestSnapshot;
  const currentMetrics = current.productMetrics.latestSnapshot;

  return {
    operatingStage: compareValue(previous.operatingStage, current.operatingStage),
    commercial: {
      commercialStatus: compareValue(previousCommercial?.commercialStatus, currentCommercial?.commercialStatus),
      paymentStatus: compareValue(previousCommercial?.paymentStatus, currentCommercial?.paymentStatus),
      contractStatus: compareValue(previousCommercial?.contractStatus, currentCommercial?.contractStatus),
    },
    health: {
      finalScore: compareValue(previousHealth?.finalScore, currentHealth?.finalScore),
      finalStatus: compareValue(previousHealth?.finalStatus, currentHealth?.finalStatus),
      trend: compareValue(previousHealth?.trend, currentHealth?.trend),
      confidence: compareValue(previousHealth?.confidence, currentHealth?.confidence),
    },
    productMetrics: {
      platformHealth: compareValue(previousMetrics?.platformHealth, currentMetrics?.platformHealth),
      projectsTotal: compareValue(previousMetrics?.projectsTotal, currentMetrics?.projectsTotal),
      usersTotal: compareValue(previousMetrics?.usersTotal, currentMetrics?.usersTotal),
    },
  };
}

function sumProductActivity(snapshots: ProductMetricSnapshot[]): WeeklyProductActivityTotals {
  return {
    projectsCreatedInPeriod: snapshots.reduce((sum, snapshot) => sum + snapshot.projectsCreatedInWindow, 0),
    projectsCompletedInPeriod: snapshots.reduce((sum, snapshot) => sum + snapshot.projectsCompletedInWindow, 0),
    projectsErroredInPeriod: snapshots.reduce((sum, snapshot) => sum + snapshot.projectsErroredInWindow, 0),
    platformErrorsInPeriod: snapshots.reduce((sum, snapshot) => sum + snapshot.platformErrorsInWindow, 0),
  };
}

function buildProductActivityPeriodContext(
  customerId: string,
  reportDate: string,
  period: WeeklyActivityPeriod,
): WeeklyProductActivityPeriodContext {
  const rawSnapshots = getProductMetricSnapshotsForCustomer(customerId);
  const canonicalSnapshots = canonicalizeProductMetricSnapshotsAsOf(rawSnapshots, reportDate);
  const periodSnapshots = selectPeriodSnapshots(canonicalSnapshots, reportDate, period.start, period.end);
  const hasPeriodCoverage = periodSnapshots.length > 0;

  return {
    period,
    snapshots: periodSnapshots,
    hasHistoricalBaseline: canonicalSnapshots.length > 0,
    hasPeriodCoverage,
    totals: hasPeriodCoverage ? sumProductActivity(periodSnapshots) : undefined,
  };
}

function isWithinPeriod(date: string, period: WeeklyActivityPeriod): boolean {
  return date >= period.start && date <= period.end;
}

function buildEvidenceSignals(current: CustomerContext, activityPeriod: WeeklyActivityPeriod): WeeklyEvidenceSignals {
  return {
    currentlyCanonicalFilteredBySourceDate: current.canonicalEvidence,
    sourceDatedInActivityPeriod: current.canonicalEvidence.filter((item) => isWithinPeriod(item.sourceDate, activityPeriod)),
    temporalCoverage: 'partial_as_of',
  };
}

export function mapWeeklyActionOutcome(status: WeeklyActionStatus): WeeklyActionOutcome {
  switch (status) {
    case 'achieved':
      return 'achieved';
    case 'partial':
      return 'partial';
    case 'not_achieved':
      return 'not_achieved';
    case 'planned':
      return 'unresolved';
    case 'cancelled':
      return 'not_evaluable';
  }
}

function buildActionReview(action: WeeklyAction): WeeklyActionReview {
  return {
    action,
    expectedResult: action.expectedResult,
    status: action.status,
    outcome: mapWeeklyActionOutcome(action.status),
    actualResult: action.actualResult,
    resultNote: action.resultNote,
  };
}

function selectActionReviews(actions: WeeklyAction[], weekOf: string): WeeklyActionReview[] {
  return actions.filter((action) => action.weekOf === weekOf).map(buildActionReview);
}

function buildActionLoop(current: CustomerContext, reportDate: string, activityPeriod: WeeklyActivityPeriod): WeeklyActionLoop {
  const reviewedActions = selectActionReviews(current.weeklyActions, activityPeriod.start);
  const plannedActions = selectActionReviews(current.weeklyActions, reportDate);

  return {
    reviewedCycle: {
      weekOf: activityPeriod.start,
      actions: reviewedActions,
    },
    plannedCycle: {
      weekOf: reportDate,
      actions: plannedActions,
    },
    carryForwardCandidates: reviewedActions.filter(
      (review) => review.outcome === 'partial' || review.outcome === 'not_achieved' || review.outcome === 'unresolved',
    ),
  };
}

function buildCustomerWeeklyReportContext(
  current: CustomerContext,
  previous: CustomerContext,
  reportDate: string,
  activityPeriod: WeeklyActivityPeriod,
  previousActivityPeriod: WeeklyActivityPeriod,
): WeeklyReportCustomerContext {
  const currentProductActivity = buildProductActivityPeriodContext(current.customer.id, reportDate, activityPeriod);
  const previousProductActivity = buildProductActivityPeriodContext(current.customer.id, reportDate, previousActivityPeriod);
  const periodCoverageMissingInformation: MissingInformationItem[] =
    currentProductActivity.hasHistoricalBaseline && !currentProductActivity.hasPeriodCoverage
      ? [
          {
            id: `missing-${current.customer.id}-periodCoverage-${activityPeriod.start}-${activityPeriod.end}`,
            customerId: current.customer.id,
            field: 'periodCoverage',
            asOf: reportDate,
            periodStart: activityPeriod.start,
            periodEnd: activityPeriod.end,
          },
        ]
      : [];

  return {
    customerId: current.customer.id,
    customerName: current.customer.name,
    current,
    previous,
    activityPeriod,
    previousActivityPeriod,
    changes: buildChanges(previous, current),
    productActivity: {
      current: currentProductActivity,
      previous: previousProductActivity,
    },
    evidenceSignals: buildEvidenceSignals(current, activityPeriod),
    attention: {
      riskAttention: current.riskAttention,
      commercialAttention: current.commercial.commercialAttention,
      temporalCoverage: {
        riskAttention: 'current_state_only',
        commercialAttention: 'as_of',
      },
    },
    actionLoop: buildActionLoop(current, reportDate, activityPeriod),
    temporalCoverage: current.temporalCoverage,
    temporalLimitations: current.temporalLimitations,
    missingInformation: [...current.missingInformation, ...periodCoverageMissingInformation],
  };
}

export function getWeeklyReportContext(reportDate: string): WeeklyReportContext {
  const previousAsOf = resolvePreviousAsOf(reportDate);
  const activityPeriod = resolveActivityPeriod(reportDate);
  const previousActivityPeriod = resolvePreviousActivityPeriod(reportDate);

  const customers = getCustomers()
    .map((customer) => {
      const current = getCustomerContext(customer.id, reportDate);
      const previous = getCustomerContext(customer.id, previousAsOf);
      if (!current || !previous) return undefined;
      return buildCustomerWeeklyReportContext(current, previous, reportDate, activityPeriod, previousActivityPeriod);
    })
    .filter((customer): customer is WeeklyReportCustomerContext => Boolean(customer));

  return {
    reportDate,
    previousAsOf,
    activityPeriod,
    previousActivityPeriod,
    portfolio: {
      current: getWeeklyPortfolioStatus(reportDate, activityPeriod.start, activityPeriod.end),
      previous: getWeeklyPortfolioStatus(previousAsOf, previousActivityPeriod.start, previousActivityPeriod.end),
      temporalCoverage: {
        roster: 'current_state',
        metrics: 'as_of',
        activity: 'as_of',
      },
      temporalLimitations: PORTFOLIO_TEMPORAL_LIMITATIONS,
    },
    customers,
  };
}
