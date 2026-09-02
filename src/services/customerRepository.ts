import { resolveHealthSnapshot } from '../lib/healthEngine';
import { adoptionSnapshots } from '../data/adoptionSnapshots';
import { commitments } from '../data/commitments';
import { customers } from '../data/customers';
import { evidence } from '../data/evidence';
import { healthSnapshotInputs } from '../data/healthSnapshots';
import { insights } from '../data/insights';
import { milestones } from '../data/milestones';
import { nextActions } from '../data/nextActions';
import { platformTelemetrySnapshots } from '../data/platformTelemetry';
import { risks } from '../data/risks';
import { signals } from '../data/signals';
import { timelineEvents } from '../data/timelineEvents';
import { valueMetrics } from '../data/valueMetrics';
import type { AdoptionSnapshot } from '../types/adoption';
import type { Commitment } from '../types/commitment';
import type { Customer } from '../types/customer';
import type { Evidence } from '../types/evidence';
import type { HealthSnapshot } from '../types/healthSnapshot';
import type { Insight, InsightSection } from '../types/insight';
import type { Milestone } from '../types/milestone';
import type { NextAction, NextActionScope } from '../types/nextAction';
import type { PlatformTelemetrySnapshot } from '../types/platformTelemetry';
import type { PortfolioSignal } from '../types/signal';
import type { Risk } from '../types/risk';
import type { TimelineEvent } from '../types/timelineEvent';
import type { ValueMetricEntry } from '../types/valueMetric';

// The ONLY module that reads from src/data/*. Every consumer (pages, lib/portfolio.ts)
// must go through these functions so that swapping local arrays for a real API later
// means rewriting this file only.

export function getCustomers(): Customer[] {
  return customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function getHealthSnapshotsForCustomer(customerId: string): HealthSnapshot[] {
  return healthSnapshotInputs
    .filter((snapshot) => snapshot.customerId === customerId)
    .map(resolveHealthSnapshot)
    .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
}

export function getLatestHealthSnapshot(customerId: string): HealthSnapshot | undefined {
  const snapshots = getHealthSnapshotsForCustomer(customerId);
  return snapshots[snapshots.length - 1];
}

export function getEvidenceForCustomer(customerId: string): Evidence[] {
  return evidence.filter((item) => item.customerId === customerId);
}

export function getRisksForCustomer(customerId: string): Risk[] {
  return risks.filter((risk) => risk.customerId === customerId);
}

export function getCommitmentsForCustomer(customerId: string): Commitment[] {
  return commitments.filter((commitment) => commitment.customerId === customerId);
}

export function getMilestonesForCustomer(customerId: string): Milestone[] {
  return milestones.filter((milestone) => milestone.customerId === customerId);
}

export function getLatestAdoptionSnapshot(customerId: string): AdoptionSnapshot | undefined {
  return adoptionSnapshots
    .filter((snapshot) => snapshot.customerId === customerId)
    .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))[0];
}

export function getInsightsForCustomer(customerId: string, section: InsightSection): Insight[] {
  return insights.filter((insight) => insight.customerId === customerId && insight.section === section);
}

// All insights for a customer regardless of section — used by the Historial view
// to fold curated conclusions into the account timeline.
export function getAllInsightsForCustomer(customerId: string): Insight[] {
  return insights.filter((insight) => insight.customerId === customerId);
}

export function getValueMetricsForCustomer(customerId: string): ValueMetricEntry[] {
  return valueMetrics.filter((metric) => metric.customerId === customerId);
}

export function getTimelineEventsForCustomer(customerId: string): TimelineEvent[] {
  return timelineEvents
    .filter((event) => event.customerId === customerId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getLatestPlatformTelemetry(customerId: string): PlatformTelemetrySnapshot | undefined {
  return platformTelemetrySnapshots
    .filter((snapshot) => snapshot.customerId === customerId)
    .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))[0];
}

// scope is optional — most accounts have exactly one NextAction (their current
// primary next step), reused as the closing line on every deep tab. Pass a scope
// only when an account has more than one and a tab needs a specific one.
export function getNextActionsForCustomer(customerId: string, scope?: NextActionScope): NextAction[] {
  return nextActions.filter((action) => action.customerId === customerId && (!scope || action.scope === scope));
}

export function getPortfolioSignals(): PortfolioSignal[] {
  return signals;
}
