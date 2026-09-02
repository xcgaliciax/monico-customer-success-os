// A curated, closed operational conclusion — spec §10 "Patrón de insight". Never
// raw evidence and never hedged prose; if there is no evidence to sustain it, the
// insight should not exist. relatedEvidenceIds trace the conclusion back to §07 data.
export type InsightSection = 'why_score' | 'adoption';

export interface Insight {
  id: string;
  customerId: string;
  section: InsightSection;
  statement: string;
  context?: string;
  relatedEvidenceIds?: string[];
}
