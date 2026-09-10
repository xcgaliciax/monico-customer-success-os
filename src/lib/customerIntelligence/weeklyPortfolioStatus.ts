import {
  getCommercialStatusSnapshotsForCustomer,
  getCommitmentsForCustomer,
  getCustomers,
  getEvidenceForCustomer,
  getNextActionsForCustomer,
  getOperatingStageForCustomer,
  getProductMetricSnapshotsForCustomer,
  getRisksForCustomer,
  getWeeklyActionsForCustomer,
} from '../../services/customerRepository';
import {
  buildCommercialAttention,
  buildMissingInformation,
  buildRiskAttentionItems,
  canonicalizeProductMetricSnapshotsAsOf,
  selectLatestProductMetricSnapshotAsOf,
  selectPeriodSnapshots,
  type AttentionItem,
  type CommercialAttentionItem,
  type MissingInformationItem,
} from './customerIntelligenceSelectors';
import { latestAtOrBefore } from './preWeeklyScorecard';
import type { Commitment } from '../../types/commitment';
import type { CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { Customer } from '../../types/customer';
import type { Evidence } from '../../types/evidence';
import type { NextAction } from '../../types/nextAction';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { Risk } from '../../types/risk';
import type { WeeklyAction } from '../../types/weeklyAction';

export {
  buildCommercialAttention,
  canonicalizeProductMetricSnapshots,
  isFullyWithinPeriod,
  selectPeriodSnapshots,
} from './customerIntelligenceSelectors';
export type { CommercialAttentionItem, MissingInformationField, MissingInformationItem } from './customerIntelligenceSelectors';

// getWeeklyPortfolioStatus — the deterministic core of the CS Intelligence
// Service, and the structured source for the recurring Wednesday Weekly
// Customer Status report. Pure aggregation over the existing repository: no
// LLM, no generated prose, no judgment. Every field is either a direct read
// or a literal filter/sum of existing entities.
//
// Signals != Evidence != Scores != Decisions, and platformHealth != csHealth —
// this module reads ProductMetricSnapshot (platform) and leaves HealthSnapshot
// (csHealth/Health Score) untouched; it never imports from healthEngine and
// never recomputes or reweights anything healthEngine already owns. Commercial
// standing similarly never affects csHealth or platformHealth, and never
// borrows "Health" vocabulary (see types/commercialStatusSnapshot.ts).
//
// Missing data is represented as undefined/empty/an explicit missingInformation
// entry, never invented: a customer with no ProductMetricSnapshot (e.g. a new
// pre_contract account) gets recentProductMetricSnapshot: undefined, not a
// fabricated zero-value snapshot. A customer whose latest snapshot legitimately
// reports zero activity keeps those zeros as-is — zero activity is a fact, not
// an inferred risk, and this module never synthesizes a Risk from an activity
// number.
//
// Three attention-shaped concepts are kept structurally separate — riskAttention
// (Risk-derived), commercialAttention (CommercialStatusSnapshot-derived) and
// missingInformation (data-completeness facts only) — deliberately with no
// shared severity vocabulary, so nothing can accidentally sort/merge all three
// as one undifferentiated "attention" list.

export interface WeeklyPortfolioSummary {
  customerCount: number;
  // Sum of each customer's most recent canonical ProductMetricSnapshot (as of
  // `asOf`) — a customer with no snapshot yet contributes 0, it is not skipped.
  historicalProjectsTotal: number;
  historicalUsersTotal: number;
  // Sums restricted to canonical ProductMetricSnapshot windows FULLY contained
  // within [periodStart, periodEnd] — see selectPeriodSnapshots. A snapshot
  // that only partially overlaps the period contributes nothing here.
  projectsCreatedInPeriod: number;
  projectsCompletedInPeriod: number;
  projectErrorsInPeriod: number;
}

export interface CustomerWeeklyStatus {
  customerId: string;
  customerName: string;
  operatingStage?: OperatingStage;
  recentProductMetricSnapshot?: ProductMetricSnapshot;
  evidence: Evidence[];
  risks: Risk[];
  commitments: Commitment[];
  nextActions: NextAction[];
  commercialStatusSnapshot?: CommercialStatusSnapshot;
  weeklyActions: WeeklyAction[];
  // Exactly today's Customer Intelligence attentionItems — same selector
  // (selectAttentionRisks), same build logic (buildAttentionItems), Risk
  // semantics unchanged. Renamed on this contract only, to sit unambiguously
  // alongside commercialAttention/missingInformation without implying they're
  // the same kind of thing.
  riskAttention: AttentionItem[];
  commercialAttention: CommercialAttentionItem[];
  missingInformation: MissingInformationItem[];
  // Literal expectedResult values pulled from this customer's WeeklyActions in
  // the period — factual aggregation only, never a synthesized conclusion.
  expectedResults: string[];
}

export interface WeeklyPortfolioStatus {
  asOf: string;
  periodStart: string;
  periodEnd: string;
  summary: WeeklyPortfolioSummary;
  customers: CustomerWeeklyStatus[];
}

function defaultPeriodStart(periodEnd: string): string {
  const end = new Date(`${periodEnd}T00:00:00`);
  end.setDate(end.getDate() - 6);
  return end.toISOString().slice(0, 10);
}

function hasFullPeriodCoverage(canonicalSnapshots: ProductMetricSnapshot[], asOf: string, periodStart: string, periodEnd: string): boolean {
  return selectPeriodSnapshots(canonicalSnapshots, asOf, periodStart, periodEnd).length > 0;
}

function getCanonicalProductMetricSnapshotsForCustomer(customerId: string, asOf: string): ProductMetricSnapshot[] {
  return canonicalizeProductMetricSnapshotsAsOf(getProductMetricSnapshotsForCustomer(customerId), asOf);
}

function buildCustomerWeeklyStatus(customer: Customer, asOf: string, periodStart: string, periodEnd: string): CustomerWeeklyStatus {
  const stageSnapshot = getOperatingStageForCustomer(customer.id);
  const operatingStage = stageSnapshot && stageSnapshot.asOfDate <= asOf ? stageSnapshot.stage : undefined;

  const rawMetricSnapshots = getProductMetricSnapshotsForCustomer(customer.id);
  const canonicalMetricSnapshots = canonicalizeProductMetricSnapshotsAsOf(rawMetricSnapshots, asOf);
  const recentProductMetricSnapshot = selectLatestProductMetricSnapshotAsOf(rawMetricSnapshots, asOf);
  const periodCoverage = hasFullPeriodCoverage(canonicalMetricSnapshots, asOf, periodStart, periodEnd);

  const commercialSnapshots = getCommercialStatusSnapshotsForCustomer(customer.id);
  const commercialStatusSnapshot = latestAtOrBefore(commercialSnapshots, asOf, (snapshot) => snapshot.snapshotDate);

  const weeklyActionsInPeriod = getWeeklyActionsForCustomer(customer.id).filter(
    (action) => action.weekOf >= periodStart && action.weekOf <= periodEnd,
  );

  const evidence = getEvidenceForCustomer(customer.id);
  const risks = getRisksForCustomer(customer.id);
  const nextActions = getNextActionsForCustomer(customer.id);

  return {
    customerId: customer.id,
    customerName: customer.name,
    operatingStage,
    recentProductMetricSnapshot,
    evidence,
    risks,
    commitments: getCommitmentsForCustomer(customer.id),
    nextActions,
    commercialStatusSnapshot,
    weeklyActions: weeklyActionsInPeriod,
    riskAttention: buildRiskAttentionItems(risks, evidence, nextActions),
    commercialAttention: buildCommercialAttention(customer.id, commercialStatusSnapshot),
    missingInformation: buildMissingInformation(customer.id, asOf, {
      operatingStage,
      commercialStatusSnapshot,
      productMetricSnapshot: recentProductMetricSnapshot,
      hasAnyMetricSnapshots: rawMetricSnapshots.length > 0,
      hasPeriodCoverage: periodCoverage,
    }, { periodStart, periodEnd }),
    expectedResults: weeklyActionsInPeriod.map((action) => action.expectedResult),
  };
}

function buildSummary(customers: Customer[], asOf: string, periodStart: string, periodEnd: string): WeeklyPortfolioSummary {
  let historicalProjectsTotal = 0;
  let historicalUsersTotal = 0;
  let projectsCreatedInPeriod = 0;
  let projectsCompletedInPeriod = 0;
  let projectErrorsInPeriod = 0;

  for (const customer of customers) {
    const canonicalMetricSnapshots = getCanonicalProductMetricSnapshotsForCustomer(customer.id, asOf);

    const recent = latestAtOrBefore(canonicalMetricSnapshots, asOf, (snapshot) => snapshot.windowEnd);
    if (recent) {
      historicalProjectsTotal += recent.projectsTotal;
      historicalUsersTotal += recent.usersTotal;
    }

    for (const snapshot of selectPeriodSnapshots(canonicalMetricSnapshots, asOf, periodStart, periodEnd)) {
      projectsCreatedInPeriod += snapshot.projectsCreatedInWindow;
      projectsCompletedInPeriod += snapshot.projectsCompletedInWindow;
      projectErrorsInPeriod += snapshot.projectsErroredInWindow;
    }
  }

  return {
    customerCount: customers.length,
    historicalProjectsTotal,
    historicalUsersTotal,
    projectsCreatedInPeriod,
    projectsCompletedInPeriod,
    projectErrorsInPeriod,
  };
}

// asOfDate is the report's reference date. periodStart/periodEnd default to the
// 7-day window ending at asOfDate (the same windowing convention already used
// by ProductMetricSnapshot), and may be overridden explicitly — e.g. to build
// a report for a period other than "the week ending today".
export function getWeeklyPortfolioStatus(asOfDate: string, periodStart?: string, periodEnd?: string): WeeklyPortfolioStatus {
  const resolvedPeriodEnd = periodEnd ?? asOfDate;
  const resolvedPeriodStart = periodStart ?? defaultPeriodStart(resolvedPeriodEnd);

  const customers = getCustomers();

  return {
    asOf: asOfDate,
    periodStart: resolvedPeriodStart,
    periodEnd: resolvedPeriodEnd,
    summary: buildSummary(customers, asOfDate, resolvedPeriodStart, resolvedPeriodEnd),
    customers: customers.map((customer) => buildCustomerWeeklyStatus(customer, asOfDate, resolvedPeriodStart, resolvedPeriodEnd)),
  };
}
