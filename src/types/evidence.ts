import type { Confidence, DimensionKey } from './health';

export type EvidenceType =
  | 'product_telemetry'
  | 'meeting_transcript'
  | 'customer_statement'
  | 'case_study'
  | 'customer_success_observation'
  | 'commercial_event'
  | 'expansion_signal'
  | 'blocker'
  | 'dependency'
  | 'product_feedback';

export interface Evidence {
  id: string;
  customerId: string;
  type: EvidenceType;
  category: string;
  statement: string;
  source: string;
  sourceDate: string; // ISO date
  confidence: Confidence;
  verified: boolean;
  impact: 'positive' | 'negative' | 'neutral';
  relatedDimension?: DimensionKey; // not all evidence maps cleanly to one dimension
  // Additive traceability fields — not rendered in v0.1 UI, but present so future
  // transcript/telemetry ingestion can trace back to an exact source without a schema change.
  sourceId?: string;
  sourceUrl?: string;
  sourceTimestamp?: string;
  excerpt?: string;
  createdBy?: 'human' | 'ai' | 'system';
}
