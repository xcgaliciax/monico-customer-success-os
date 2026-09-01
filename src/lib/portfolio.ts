import { getCustomers, getLatestHealthSnapshot } from '../services/customerRepository';
import type { HealthStatus } from '../types/health';

// Cross-customer aggregation only. No scoring math happens here — that's healthEngine's
// job. This module calls the repository, never src/data/* directly.

export interface PortfolioSummary {
  accountCount: number;
  totalArrUsd: number;
  statusCounts: Record<HealthStatus, number>;
  improvingCount: number;
}

export function getPortfolioSummary(): PortfolioSummary {
  const customers = getCustomers();
  const statusCounts: Record<HealthStatus, number> = { green: 0, yellow: 0, red: 0 };
  let improvingCount = 0;
  let totalArrUsd = 0;

  for (const customer of customers) {
    totalArrUsd += customer.arrUsd;
    const snapshot = getLatestHealthSnapshot(customer.id);
    if (!snapshot) continue;
    statusCounts[snapshot.finalStatus] += 1;
    if (snapshot.trend === 'improving') improvingCount += 1;
  }

  return { accountCount: customers.length, totalArrUsd, statusCounts, improvingCount };
}

export interface ModuleAdoption {
  module: string;
  accountsUsing: number;
  totalAccounts: number;
}

// Derived cross-account product-usage pattern (e.g. for a future Portfolio Insights
// screen) — computed from Customer.modulesUsed, not hand-authored prose.
export function getModuleAdoption(): ModuleAdoption[] {
  const customers = getCustomers();
  const moduleNames = new Set<string>();
  for (const customer of customers) {
    for (const module of customer.modulesUsed) moduleNames.add(module);
  }

  return Array.from(moduleNames)
    .map((module) => ({
      module,
      accountsUsing: customers.filter((customer) => customer.modulesUsed.includes(module)).length,
      totalAccounts: customers.length,
    }))
    .sort((a, b) => b.accountsUsing - a.accountsUsing);
}
