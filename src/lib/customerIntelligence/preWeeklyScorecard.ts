import {
  getCommitmentsForCustomer,
  getCustomerById,
  getEvidenceForCustomer,
  getHealthSnapshotsForCustomer,
  getNextActionsForCustomer,
  getOperatingStageForCustomer,
  getProductMetricSnapshotsForCustomer,
  getRisksForCustomer,
} from '../../services/customerRepository';
import { getCustomerIntelligence, type AttentionItem, type OpportunityItem } from './customer';
import type { Confidence, HealthStatus, Trend } from '../../types/health';
import type { HealthSnapshot } from '../../types/healthSnapshot';
import type { OperatingStage } from '../../types/operatingStage';
import type { ProductMetricSnapshot } from '../../types/productMetricSnapshot';
import type { Risk } from '../../types/risk';
import type { Commitment } from '../../types/commitment';
import type { NextAction } from '../../types/nextAction';

// The customer-level "60-second briefing" ahead of that account's Weekly.
// Deliberately reuses Customer Intelligence, Risks, Commitments, Next Actions,
// Health and Evidence exactly as they already exist — no parallel derivation
// logic. platformHealth is read from ProductMetricSnapshot and kept separate
// from csHealth (from HealthSnapshot/healthEngine): they measure different
// things and must never be combined or conflated.
//
// meetingObjective/bestQuestion are left undefined in this slice — generating
// them requires judgment/synthesis this slice deliberately excludes (no AI
// call yet). Honest absence, never fabricated, matching this codebase's
// existing convention (see AttentionItem.nextAction / OpportunityItem.nextAction).

export interface ActivitySnapshotView {
  windowStart: string;
  windowEnd: string;
  projectsCreatedInWindow: number;
  projectsCompletedInWindow: number;
  projectsErroredInWindow: number;
  platformErrorsInWindow: number;
  avgAnalysisSeconds: number;
}

export interface EvidenceFreshness {
  mostRecentEvidenceDate?: string;
  mostRecentProductMetricDate?: string;
  daysSinceLastEvidence?: number;
}

export interface PreWeeklyScorecard {
  customerId: string;
  customerName: string;
  asOf: string;

  operatingStage?: OperatingStage;
  csHealth?: { score: number; status: HealthStatus; trend: Trend; confidence: Confidence };
  platformHealth?: number;

  activity?: ActivitySnapshotView;
  // Deterministic factual deltas vs. the prior in-window snapshot only — empty
  // when there is no prior snapshot to compare against (never a fabricated trend).
  whatChanged: string[];

  positiveSignals: OpportunityItem[];
  watchItems: AttentionItem[];
  openBlockers: Risk[];
  openCommitments: Commitment[];

  meetingObjective?: string;
  bestQuestion?: string;
  csRecommendation?: NextAction;

  evidenceFreshness: EvidenceFreshness;
}

// Exported for direct unit testing with synthetic fixtures (see
// preWeeklyScorecard.test.ts) — real seed data always has at most one
// snapshot per customer today, so these code paths can only be exercised
// against fabricated data, never against the real evidence-grounded seed.
export function latestAtOrBefore<T>(items: T[], asOf: string, dateOf: (item: T) => string): T | undefined {
  const eligible = items.filter((item) => dateOf(item) <= asOf);
  return eligible[eligible.length - 1];
}

export function previousOf<T>(items: T[], asOf: string, dateOf: (item: T) => string): T | undefined {
  const eligible = items.filter((item) => dateOf(item) <= asOf);
  return eligible[eligible.length - 2];
}

export function describeMetricChanges(current: ProductMetricSnapshot, previous: ProductMetricSnapshot | undefined): string[] {
  if (!previous) return [];
  const lines: string[] = [];
  if (current.projectsCreatedInWindow !== previous.projectsCreatedInWindow) {
    lines.push(`Proyectos creados: ${previous.projectsCreatedInWindow} → ${current.projectsCreatedInWindow}`);
  }
  if (current.projectsCompletedInWindow !== previous.projectsCompletedInWindow) {
    lines.push(`Proyectos completados: ${previous.projectsCompletedInWindow} → ${current.projectsCompletedInWindow}`);
  }
  if (current.projectsErroredInWindow !== previous.projectsErroredInWindow) {
    lines.push(`Proyectos con error: ${previous.projectsErroredInWindow} → ${current.projectsErroredInWindow}`);
  }
  if (current.platformErrorsInWindow !== previous.platformErrorsInWindow) {
    lines.push(`Errores de plataforma: ${previous.platformErrorsInWindow} → ${current.platformErrorsInWindow}`);
  }
  if (current.platformHealth !== previous.platformHealth) {
    lines.push(`Salud de plataforma: ${previous.platformHealth} → ${current.platformHealth}`);
  }
  return lines;
}

export function describeHealthChanges(current: HealthSnapshot, previous: HealthSnapshot | undefined): string[] {
  if (!previous) return [];
  const lines: string[] = [];
  if (current.finalScore !== previous.finalScore) {
    lines.push(`Health Score: ${previous.finalScore} → ${current.finalScore}`);
  }
  if (current.trend !== previous.trend) {
    lines.push(`Tendencia: ${previous.trend} → ${current.trend}`);
  }
  return lines;
}

export function getPreWeeklyScorecard(customerId: string, asOf: string): PreWeeklyScorecard | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const healthSnapshots = getHealthSnapshotsForCustomer(customerId);
  const currentHealth = latestAtOrBefore(healthSnapshots, asOf, (s) => s.snapshotDate);
  const previousHealth = previousOf(healthSnapshots, asOf, (s) => s.snapshotDate);

  const metricSnapshots = getProductMetricSnapshotsForCustomer(customerId);
  const currentMetrics = latestAtOrBefore(metricSnapshots, asOf, (s) => s.windowEnd);
  const previousMetrics = previousOf(metricSnapshots, asOf, (s) => s.windowEnd);

  const stageSnapshot = getOperatingStageForCustomer(customerId);
  const operatingStage = stageSnapshot && stageSnapshot.asOfDate <= asOf ? stageSnapshot.stage : undefined;

  const intelligence = getCustomerIntelligence(customerId);
  const evidence = getEvidenceForCustomer(customerId).filter((item) => item.sourceDate <= asOf);
  const mostRecentEvidenceDate = evidence
    .map((item) => item.sourceDate)
    .sort((a, b) => b.localeCompare(a))[0];

  const daysSinceLastEvidence = mostRecentEvidenceDate
    ? Math.round((Date.parse(asOf) - Date.parse(mostRecentEvidenceDate)) / (1000 * 60 * 60 * 24))
    : undefined;

  return {
    customerId,
    customerName: customer.name,
    asOf,

    operatingStage,
    csHealth: currentHealth
      ? { score: currentHealth.finalScore, status: currentHealth.finalStatus, trend: currentHealth.trend, confidence: currentHealth.confidence }
      : undefined,
    platformHealth: currentMetrics?.platformHealth,

    activity: currentMetrics
      ? {
          windowStart: currentMetrics.windowStart,
          windowEnd: currentMetrics.windowEnd,
          projectsCreatedInWindow: currentMetrics.projectsCreatedInWindow,
          projectsCompletedInWindow: currentMetrics.projectsCompletedInWindow,
          projectsErroredInWindow: currentMetrics.projectsErroredInWindow,
          platformErrorsInWindow: currentMetrics.platformErrorsInWindow,
          avgAnalysisSeconds: currentMetrics.avgAnalysisSeconds,
        }
      : undefined,

    whatChanged: [
      ...(currentMetrics ? describeMetricChanges(currentMetrics, previousMetrics) : []),
      ...(currentHealth ? describeHealthChanges(currentHealth, previousHealth) : []),
    ],

    positiveSignals: intelligence?.opportunityItems ?? [],
    watchItems: intelligence?.attentionItems ?? [],
    openBlockers: getRisksForCustomer(customerId).filter((risk) => risk.status === 'open' && (!risk.openedAt || risk.openedAt <= asOf)),
    openCommitments: getCommitmentsForCustomer(customerId).filter((commitment) => commitment.status !== 'done'),

    meetingObjective: undefined,
    bestQuestion: undefined,
    csRecommendation: getNextActionsForCustomer(customerId, 'summary')[0],

    evidenceFreshness: {
      mostRecentEvidenceDate,
      mostRecentProductMetricDate: currentMetrics?.snapshotDate,
      daysSinceLastEvidence,
    },
  };
}
