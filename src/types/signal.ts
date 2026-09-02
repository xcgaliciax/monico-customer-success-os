import type { Provenance } from './provenance';

// Cross-portfolio product/adoption signal (Señales tab). Distinct from a per-
// customer Insight: a signal describes a pattern observed across the portfolio
// (or a single account's standout pattern), not one account's HealthScore driver.
export interface PortfolioSignal {
  id: string;
  title: string;
  statement: string;
  provenance: Provenance;
  relatedCustomerId?: string;
}
