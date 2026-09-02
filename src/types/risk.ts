import type { DimensionKey } from './health';

export type RiskSeverity = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'monitoring' | 'resolved';

// Covers risks, blockers, and dependencies as one operational entity, distinguished
// by severity/status/dependencyType rather than separate types.
export interface Risk {
  id: string;
  customerId: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  owner?: string;
  openedAt?: string; // ISO date
  dependencyType?: 'internal' | 'external';
  relatedDimension?: DimensionKey;
  // Additive short-form fields for the RiskRow card (spec §12) — the long-form
  // title/description above remain canonical for the future Riesgos/Evidencia tabs.
  shortTitle?: string;
  shortCause?: string;
  dependencyTypeLabel?: string;
  healthImpactStatement?: string;
}
