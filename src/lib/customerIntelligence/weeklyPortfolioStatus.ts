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
import { getCustomerIntelligence, type AttentionItem } from './customer';
import { latestAtOrBefore } from './preWeeklyScorecard';
import type { Commitment } from '../../types/commitment';
import type { CommercialStanding, CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { Customer } from '../../types/customer';
import type { Evidence } from '../../types/evidence';
import type { NextAction } from '../../types/nextAction';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { Risk } from '../../types/risk';
import type { WeeklyAction } from '../../types/weeklyAction';

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

// Derived only from CommercialStatusSnapshot — never from Risk, never from
// HealthSnapshot/ProductMetricSnapshot. commercialStatus here is always
// 'attention' | 'critical' | 'unknown' (an existing snapshot asserting it
// doesn't know); 'healthy' and 'pre_contract' never produce an item. No
// severity field — never comparable/sortable against RiskSeverity.
export interface CommercialAttentionItem {
  id: string;
  customerId: string;
  commercialStatus: CommercialStanding;
  cause?: string; // verbatim CommercialStatusSnapshot.commercialRisk — never inferred
  nextCommercialAction?: string; // verbatim passthrough
}

// Purely mechanical, non-judgmental data-completeness facts. Never a Risk,
// never a severity, never an inferred conclusion — just "this field was
// undefined as of this date" or "no snapshot fully covers this period".
export type MissingInformationField =
  | 'productMetricSnapshot'
  | 'commercialStatusSnapshot'
  | 'operatingStage'
  | 'periodCoverage';

export interface MissingInformationItem {
  id: string;
  customerId: string;
  field: MissingInformationField;
  asOf: string;
  periodStart?: string; // set only when field === 'periodCoverage'
  periodEnd?: string; // set only when field === 'periodCoverage'
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

// Exported for direct unit testing with synthetic fixtures (see
// weeklyPortfolioStatus.test.ts) — same convention as preWeeklyScorecard.ts's
// latestAtOrBefore/previousOf.
//
// Canonicalizes by (customerId, windowStart, windowEnd): when more than one
// ProductMetricSnapshot exists for the same window (e.g. a corrected re-entry),
// the one with the latest snapshotDate wins. Ties break deterministically on
// id (lexicographic) rather than depending on input/array order. ALL downstream
// metric logic (historical totals, recentProductMetricSnapshot, period sums)
// must run on this canonicalized set, never on the raw repository array.
export function canonicalizeProductMetricSnapshots(snapshots: ProductMetricSnapshot[]): ProductMetricSnapshot[] {
  const canonicalByWindow = new Map<string, ProductMetricSnapshot>();

  for (const snapshot of snapshots) {
    const key = `${snapshot.customerId}|${snapshot.windowStart}|${snapshot.windowEnd}`;
    const existing = canonicalByWindow.get(key);
    if (!existing || isMoreCanonical(snapshot, existing)) {
      canonicalByWindow.set(key, snapshot);
    }
  }

  return Array.from(canonicalByWindow.values()).sort((a, b) => a.windowEnd.localeCompare(b.windowEnd));
}

function isMoreCanonical(candidate: ProductMetricSnapshot, current: ProductMetricSnapshot): boolean {
  if (candidate.snapshotDate !== current.snapshotDate) {
    return candidate.snapshotDate > current.snapshotDate;
  }
  return candidate.id > current.id;
}

// A snapshot's counters are pre-aggregated over its own window and can never
// be prorated onto a different window — so "does this snapshot belong to the
// period" must be full containment, never partial overlap.
export function isFullyWithinPeriod(snapshot: ProductMetricSnapshot, periodStart: string, periodEnd: string): boolean {
  return snapshot.windowStart >= periodStart && snapshot.windowEnd <= periodEnd;
}

// The exact set of canonical snapshots that may contribute to period sums:
// fully contained in [periodStart, periodEnd], and not dated after `asOf`.
// Exported so both buildSummary and the missingInformation/period-coverage
// check share one definition of "usable period coverage" — see
// weeklyPortfolioStatus.test.ts for direct synthetic-fixture coverage.
export function selectPeriodSnapshots(
  canonicalSnapshots: ProductMetricSnapshot[],
  asOf: string,
  periodStart: string,
  periodEnd: string,
): ProductMetricSnapshot[] {
  return canonicalSnapshots.filter(
    (snapshot) => snapshot.windowEnd <= asOf && isFullyWithinPeriod(snapshot, periodStart, periodEnd),
  );
}

function hasFullPeriodCoverage(canonicalSnapshots: ProductMetricSnapshot[], asOf: string, periodStart: string, periodEnd: string): boolean {
  return selectPeriodSnapshots(canonicalSnapshots, asOf, periodStart, periodEnd).length > 0;
}

function getCanonicalProductMetricSnapshotsForCustomer(customerId: string): ProductMetricSnapshot[] {
  return canonicalizeProductMetricSnapshots(getProductMetricSnapshotsForCustomer(customerId));
}

const COMMERCIAL_ATTENTION_STATUSES: ReadonlySet<CommercialStanding> = new Set(['attention', 'critical', 'unknown']);

// pre_contract and healthy never produce an item — being new/pre-contract is
// an expected lifecycle state, not itself something requiring attention (same
// principle as "zero activity is not an inferred risk"). Exported for direct
// unit testing with synthetic CommercialStatusSnapshot fixtures — the real
// seed data has no 'attention'/'critical'/'unknown' account today, so those
// paths can only be exercised against fabricated data, never the real seed.
export function buildCommercialAttention(customerId: string, snapshot: CommercialStatusSnapshot | undefined): CommercialAttentionItem[] {
  if (!snapshot || !COMMERCIAL_ATTENTION_STATUSES.has(snapshot.commercialStatus)) return [];

  return [
    {
      id: `commercial-attention-${snapshot.id}`,
      customerId,
      commercialStatus: snapshot.commercialStatus,
      cause: snapshot.commercialRisk,
      nextCommercialAction: snapshot.nextCommercialAction,
    },
  ];
}

interface MissingInformationInputs {
  operatingStage: OperatingStage | undefined;
  commercialStatusSnapshot: CommercialStatusSnapshot | undefined;
  recentProductMetricSnapshot: ProductMetricSnapshot | undefined;
  hasAnyMetricSnapshots: boolean;
  hasPeriodCoverage: boolean;
}

// No CommercialStatusSnapshot at all -> missingInformation ('commercialStatusSnapshot').
// An existing snapshot with commercialStatus 'unknown' -> commercialAttention, NOT here.
// An existing snapshot with commercialStatus 'pre_contract' -> neither list.
function buildMissingInformation(
  customerId: string,
  asOf: string,
  periodStart: string,
  periodEnd: string,
  inputs: MissingInformationInputs,
): MissingInformationItem[] {
  const items: MissingInformationItem[] = [];

  if (!inputs.recentProductMetricSnapshot) {
    items.push({ id: `missing-${customerId}-productMetricSnapshot-${asOf}`, customerId, field: 'productMetricSnapshot', asOf });
  }
  if (!inputs.commercialStatusSnapshot) {
    items.push({ id: `missing-${customerId}-commercialStatusSnapshot-${asOf}`, customerId, field: 'commercialStatusSnapshot', asOf });
  }
  if (!inputs.operatingStage) {
    items.push({ id: `missing-${customerId}-operatingStage-${asOf}`, customerId, field: 'operatingStage', asOf });
  }
  // Only flagged when the customer has metric history at all but none of it
  // fully covers the requested period (e.g. a partially-overlapping snapshot,
  // or history that predates the period) — a customer with zero snapshots
  // ever is already fully covered by the 'productMetricSnapshot' item above;
  // flagging both would be redundant noise for the same underlying gap.
  if (inputs.hasAnyMetricSnapshots && !inputs.hasPeriodCoverage) {
    items.push({
      id: `missing-${customerId}-periodCoverage-${periodStart}-${periodEnd}`,
      customerId,
      field: 'periodCoverage',
      asOf,
      periodStart,
      periodEnd,
    });
  }

  return items;
}

function buildCustomerWeeklyStatus(customer: Customer, asOf: string, periodStart: string, periodEnd: string): CustomerWeeklyStatus {
  const stageSnapshot = getOperatingStageForCustomer(customer.id);
  const operatingStage = stageSnapshot && stageSnapshot.asOfDate <= asOf ? stageSnapshot.stage : undefined;

  const canonicalMetricSnapshots = getCanonicalProductMetricSnapshotsForCustomer(customer.id);
  const recentProductMetricSnapshot = latestAtOrBefore(canonicalMetricSnapshots, asOf, (snapshot) => snapshot.windowEnd);
  const periodCoverage = hasFullPeriodCoverage(canonicalMetricSnapshots, asOf, periodStart, periodEnd);

  const commercialSnapshots = getCommercialStatusSnapshotsForCustomer(customer.id);
  const commercialStatusSnapshot = latestAtOrBefore(commercialSnapshots, asOf, (snapshot) => snapshot.snapshotDate);

  const weeklyActionsInPeriod = getWeeklyActionsForCustomer(customer.id).filter(
    (action) => action.weekOf >= periodStart && action.weekOf <= periodEnd,
  );

  const intelligence = getCustomerIntelligence(customer.id);

  return {
    customerId: customer.id,
    customerName: customer.name,
    operatingStage,
    recentProductMetricSnapshot,
    evidence: getEvidenceForCustomer(customer.id),
    risks: getRisksForCustomer(customer.id),
    commitments: getCommitmentsForCustomer(customer.id),
    nextActions: getNextActionsForCustomer(customer.id),
    commercialStatusSnapshot,
    weeklyActions: weeklyActionsInPeriod,
    riskAttention: intelligence?.attentionItems ?? [],
    commercialAttention: buildCommercialAttention(customer.id, commercialStatusSnapshot),
    missingInformation: buildMissingInformation(customer.id, asOf, periodStart, periodEnd, {
      operatingStage,
      commercialStatusSnapshot,
      recentProductMetricSnapshot,
      hasAnyMetricSnapshots: canonicalMetricSnapshots.length > 0,
      hasPeriodCoverage: periodCoverage,
    }),
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
    const canonicalMetricSnapshots = getCanonicalProductMetricSnapshotsForCustomer(customer.id);

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
