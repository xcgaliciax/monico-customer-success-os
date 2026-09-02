import type { Confidence, HealthStatus, Lifecycle, Trend } from '../types/health';

// Centralized human-readable copy for enum-typed fields, shared by portfolio.ts and
// every component that renders one of these values.
export const STATUS_LABELS: Record<HealthStatus, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

export const TREND_LABELS: Record<Trend, string> = {
  improving: 'Improving',
  stable: 'Stable',
  deteriorating: 'Deteriorating',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  implementation: 'Implementation',
  first_value: 'First Value',
  adoption: 'Adoption',
  independent_adoption: 'Independent Adoption',
  verified_outcome: 'Verified Outcome',
};
