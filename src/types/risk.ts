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
}
