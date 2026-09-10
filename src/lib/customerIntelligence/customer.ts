import type { Confidence, HealthStatus, Trend } from '../../types/health';
import type { Evidence } from '../../types/evidence';
import type { Insight } from '../../types/insight';
import type { NextAction } from '../../types/nextAction';
import {
  getCustomerById,
  getEvidenceForCustomer,
  getInsightsForCustomer,
  getLatestHealthSnapshot,
  getNextActionForInsight,
  getNextActionsForCustomer,
  getRisksForCustomer,
} from '../../services/customerRepository';
import { buildRiskAttentionItems, type AttentionItem } from './customerIntelligenceSelectors';
export type { AttentionItem } from './customerIntelligenceSelectors';

// Opportunity kind is a display label only — it never gates whether an insight
// appears (that gate is: why_score section + no linked negative-impact evidence).
export type OpportunityKind = 'opportunity' | 'adoption' | 'value' | 'health';

// "Oportunidades y señales por cuenta" — positive, curated account intelligence.
// Never a Risk, never labeled with a severity. Sourced only from why_score
// insights (the account's canonical "why this score" conclusions) with any
// negative-evidence-backed insight excluded, so an open concern already
// represented as a Risk (e.g. Fibroptica's role-activation question) doesn't
// also show up here relabeled as an opportunity.
export interface OpportunityItem {
  id: string;
  customerId: string;
  kind: OpportunityKind;
  title: string;
  statement: string;
  confidence?: Confidence;
  relatedEvidence: Evidence[];
  // The curated NextAction explicitly linked to this Insight, if one exists — see
  // getNextActionForInsight. Never fabricated: undefined means no action shown.
  nextAction?: NextAction;
}

export interface CustomerIntelligenceBrief {
  customerId: string;
  customerName: string;
  health?: {
    score: number;
    status: HealthStatus;
    trend: Trend;
    confidence: Confidence;
  };
  attentionItems: AttentionItem[];
  opportunityItems: OpportunityItem[];
}

function inferOpportunityKind(insight: Insight): OpportunityKind {
  const text = `${insight.statement} ${insight.context ?? ''}`.toLowerCase();

  if (text.includes('expans')) return 'opportunity';
  if (text.includes('valor') || text.includes('resultado')) return 'value';

  return 'health';
}

function evidenceForInsight(insight: Insight, evidence: Evidence[]): Evidence[] {
  if (!insight.relatedEvidenceIds?.length) return [];

  return evidence.filter((item) => insight.relatedEvidenceIds?.includes(item.id));
}

// Canonical "requires attention" rule: unresolved (open or monitoring) Risks,
// most severe first. This is the single source of truth for what counts as
// needing CS attention — src/lib/portfolio.ts reuses it so Panel's "Atención
// ahora" and this module's "Qué requiere atención" can never disagree on which
// risks qualify. Note this is Risk-based, not HealthScore-based: a risk here
// doesn't require a yellow/red account, and a yellow/red account with no open
// Risk selects nothing.
function buildAttentionItems(customerId: string, evidence: Evidence[]): AttentionItem[] {
  return buildRiskAttentionItems(getRisksForCustomer(customerId), evidence, getNextActionsForCustomer(customerId));
}

function buildOpportunityItems(customerId: string, evidence: Evidence[]): OpportunityItem[] {
  const whyScoreInsights = getInsightsForCustomer(customerId, 'why_score');

  return whyScoreInsights
    .map((insight) => ({ insight, relatedEvidence: evidenceForInsight(insight, evidence) }))
    .filter(({ relatedEvidence }) => !relatedEvidence.some((item) => item.impact === 'negative'))
    .map(({ insight, relatedEvidence }) => ({
      id: `opportunity-${insight.id}`,
      customerId,
      kind: inferOpportunityKind(insight),
      title: insight.statement,
      statement: insight.context ?? insight.statement,
      confidence: relatedEvidence[0]?.confidence,
      relatedEvidence,
      nextAction: getNextActionForInsight(insight.id),
    }));
}

export function getCustomerIntelligence(customerId: string): CustomerIntelligenceBrief | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const health = getLatestHealthSnapshot(customerId);
  const evidence = getEvidenceForCustomer(customerId);

  return {
    customerId,
    customerName: customer.name,
    health: health
      ? {
          score: health.finalScore,
          status: health.finalStatus,
          trend: health.trend,
          confidence: health.confidence,
        }
      : undefined,
    attentionItems: buildAttentionItems(customerId, evidence),
    opportunityItems: buildOpportunityItems(customerId, evidence),
  };
}
