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
import { getOverlayEvidence, getOverlayInsights, getOverlayNextActions, getOverlayRisks } from './customerUpdateStore';
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
//
// Evidence/Risk/Insight/NextAction additionally merge in the published Customer
// Update overlay (see services/customerUpdateStore.ts): an overlay entry with the
// same id as a seed record REPLACES it (a published 'update'/'resolve'); an
// overlay entry with a new id is a pure addition (a published 'create'). Every
// existing consumer (lib/customerIntelligence/*, lib/customer360/*, every page)
// keeps calling the same getters unchanged and transparently sees both.
function mergeById<T extends { id: string }>(seed: T[], overlay: T[]): T[] {
  if (overlay.length === 0) return seed;
  const overlayIds = new Set(overlay.map((item) => item.id));
  return [...seed.filter((item) => !overlayIds.has(item.id)), ...overlay];
}

function allEvidence(): Evidence[] {
  return mergeById(evidence, getOverlayEvidence());
}

function allRisks(): Risk[] {
  return mergeById(risks, getOverlayRisks());
}

function allInsights(): Insight[] {
  return mergeById(insights, getOverlayInsights());
}

function allNextActions(): NextAction[] {
  return mergeById(nextActions, getOverlayNextActions());
}

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
  return allEvidence().filter((item) => item.customerId === customerId);
}

export function getRisksForCustomer(customerId: string): Risk[] {
  return allRisks().filter((risk) => risk.customerId === customerId);
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
  return allInsights().filter((insight) => insight.customerId === customerId && insight.section === section);
}

// All insights for a customer regardless of section — used by the Historial view
// to fold curated conclusions into the account timeline.
export function getAllInsightsForCustomer(customerId: string): Insight[] {
  return allInsights().filter((insight) => insight.customerId === customerId);
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
  return allNextActions().filter((action) => action.customerId === customerId && (!scope || action.scope === scope));
}

// Item-level lookups for Customer Intelligence: the curated NextAction explicitly
// linked to one specific Risk/Insight, independent of the tab-level 'summary'
// action above. Returns undefined rather than fabricating one when no curated
// action has been linked to that risk/insight.
export function getNextActionForRisk(riskId: string): NextAction | undefined {
  return allNextActions().find((action) => action.relatedRiskId === riskId);
}

export function getNextActionForInsight(insightId: string): NextAction | undefined {
  return allNextActions().find((action) => action.relatedInsightId === insightId);
}

export function getPortfolioSignals(): PortfolioSignal[] {
  return signals;
}
