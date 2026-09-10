import { RISK_SEVERITY_RANK } from '../customer360/shared';
import type { CommercialStanding, CommercialStatusSnapshot } from '../../types/commercialStatusSnapshot';
import type { Evidence } from '../../types/evidence';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { NextAction } from '../../types/nextAction';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { Risk, RiskSeverity } from '../../types/risk';

export interface AttentionItem {
  id: string;
  customerId: string;
  severity: RiskSeverity;
  title: string;
  cause: string;
  implication?: string;
  relatedEvidence: Evidence[];
  nextAction?: NextAction;
}

// Derived only from CommercialStatusSnapshot — never from Risk, never from
// HealthSnapshot/ProductMetricSnapshot. No severity field: commercial attention
// must never be sortable/comparable against RiskSeverity.
export interface CommercialAttentionItem {
  id: string;
  customerId: string;
  commercialStatus: CommercialStanding;
  cause?: string;
  nextCommercialAction?: string;
}

export type MissingInformationField =
  | 'productMetricSnapshot'
  | 'commercialStatusSnapshot'
  | 'operatingStage'
  | 'healthSnapshot'
  | 'periodCoverage';

export interface MissingInformationItem {
  id: string;
  customerId: string;
  field: MissingInformationField;
  asOf: string;
  periodStart?: string;
  periodEnd?: string;
}

// Canonicalizes by (customerId, windowStart, windowEnd): when more than one
// ProductMetricSnapshot exists for the same window, the latest snapshotDate
// wins. Ties break deterministically on id.
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

// As-of product metric reads must respect both the measured window and the
// capture/version date. A correction captured after asOf is not visible to a
// historical context for an earlier date.
export function canonicalizeProductMetricSnapshotsAsOf(
  snapshots: ProductMetricSnapshot[],
  asOf: string,
): ProductMetricSnapshot[] {
  return canonicalizeProductMetricSnapshots(
    snapshots.filter((snapshot) => snapshot.windowEnd <= asOf && snapshot.snapshotDate <= asOf),
  );
}

export function selectLatestProductMetricSnapshotAsOf(
  snapshots: ProductMetricSnapshot[],
  asOf: string,
): ProductMetricSnapshot | undefined {
  const canonical = canonicalizeProductMetricSnapshotsAsOf(snapshots, asOf);
  return canonical[canonical.length - 1];
}

export function isFullyWithinPeriod(snapshot: ProductMetricSnapshot, periodStart: string, periodEnd: string): boolean {
  return snapshot.windowStart >= periodStart && snapshot.windowEnd <= periodEnd;
}

// The exact set of canonical snapshots that may contribute to period sums:
// fully contained in [periodStart, periodEnd], measured and captured by asOf.
export function selectPeriodSnapshots(
  canonicalSnapshots: ProductMetricSnapshot[],
  asOf: string,
  periodStart: string,
  periodEnd: string,
): ProductMetricSnapshot[] {
  return canonicalSnapshots.filter(
    (snapshot) =>
      snapshot.windowEnd <= asOf &&
      snapshot.snapshotDate <= asOf &&
      isFullyWithinPeriod(snapshot, periodStart, periodEnd),
  );
}

const COMMERCIAL_ATTENTION_STATUSES: ReadonlySet<CommercialStanding> = new Set(['attention', 'critical', 'unknown']);

export function buildCommercialAttention(
  customerId: string,
  snapshot: CommercialStatusSnapshot | undefined,
): CommercialAttentionItem[] {
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

export interface MissingInformationInputs {
  operatingStage: OperatingStage | undefined;
  commercialStatusSnapshot: CommercialStatusSnapshot | undefined;
  productMetricSnapshot: ProductMetricSnapshot | undefined;
  healthSnapshot?: HealthSnapshot | undefined;
  includeHealthSnapshot?: boolean;
  hasAnyMetricSnapshots?: boolean;
  hasPeriodCoverage?: boolean;
}

export function buildMissingInformation(
  customerId: string,
  asOf: string,
  inputs: MissingInformationInputs,
  period?: { periodStart: string; periodEnd: string },
): MissingInformationItem[] {
  const items: MissingInformationItem[] = [];

  if (!inputs.productMetricSnapshot) {
    items.push({ id: `missing-${customerId}-productMetricSnapshot-${asOf}`, customerId, field: 'productMetricSnapshot', asOf });
  }
  if (!inputs.commercialStatusSnapshot) {
    items.push({ id: `missing-${customerId}-commercialStatusSnapshot-${asOf}`, customerId, field: 'commercialStatusSnapshot', asOf });
  }
  if (!inputs.operatingStage) {
    items.push({ id: `missing-${customerId}-operatingStage-${asOf}`, customerId, field: 'operatingStage', asOf });
  }
  if (inputs.includeHealthSnapshot && !inputs.healthSnapshot) {
    items.push({ id: `missing-${customerId}-healthSnapshot-${asOf}`, customerId, field: 'healthSnapshot', asOf });
  }
  if (period && inputs.hasAnyMetricSnapshots && inputs.hasPeriodCoverage === false) {
    items.push({
      id: `missing-${customerId}-periodCoverage-${period.periodStart}-${period.periodEnd}`,
      customerId,
      field: 'periodCoverage',
      asOf,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
    });
  }

  return items;
}

export function selectAttentionRisks(risks: Risk[]): Risk[] {
  return risks
    .filter((risk) => risk.status === 'open' || risk.status === 'monitoring')
    .sort((a, b) => RISK_SEVERITY_RANK[b.severity] - RISK_SEVERITY_RANK[a.severity]);
}

function evidenceForRisk(risk: Risk, evidence: Evidence[]): Evidence[] {
  if (!risk.relatedEvidenceIds?.length) return [];
  return evidence.filter((item) => risk.relatedEvidenceIds?.includes(item.id));
}

export function buildRiskAttentionItems(risks: Risk[], evidence: Evidence[], nextActions: NextAction[]): AttentionItem[] {
  return selectAttentionRisks(risks).map((risk) => ({
    id: `attention-${risk.id}`,
    customerId: risk.customerId,
    severity: risk.severity,
    title: risk.shortTitle ?? risk.title,
    cause: risk.shortCause ?? risk.description,
    implication: risk.healthImpactStatement,
    relatedEvidence: evidenceForRisk(risk, evidence),
    nextAction: nextActions.find((action) => action.relatedRiskId === risk.id),
  }));
}
