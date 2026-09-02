import {
  getCustomerById,
  getCustomers,
  getLatestHealthSnapshot,
  getMilestonesForCustomer,
  getRisksForCustomer,
} from '../services/customerRepository';
import { LIFECYCLE_LABELS, STATUS_LABELS, TREND_LABELS } from './labels';
import type { HealthStatus } from '../types/health';
import type { HealthSnapshot } from '../types/healthSnapshot';
import type { Customer } from '../types/customer';
import type { Milestone } from '../types/milestone';
import type { Risk, RiskSeverity } from '../types/risk';

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

// Most recent snapshotDate observed across the portfolio's latest per-customer
// snapshots — derived, never a hardcoded "as of" string in a component.
export function getPortfolioSnapshotDate(): string | undefined {
  const dates = getCustomers()
    .map((customer) => getLatestHealthSnapshot(customer.id)?.snapshotDate)
    .filter((date): date is string => Boolean(date));
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, date) => (date > latest ? date : latest));
}

export interface PortfolioTableRow {
  customer: Customer;
  snapshot: HealthSnapshot | undefined;
  primaryRisk: Risk | undefined;
  nextMilestone: Milestone | undefined;
}

const RISK_SEVERITY_RANK: Record<RiskSeverity, number> = { high: 3, medium: 2, low: 1 };
const MILESTONE_STATUS_RANK: Record<Milestone['status'], number> = { in_progress: 2, planned: 1, reached: 0 };

function selectPrimaryRisk(risks: Risk[]): Risk | undefined {
  return risks
    .filter((risk) => risk.status === 'open' || risk.status === 'monitoring')
    .sort((a, b) => RISK_SEVERITY_RANK[b.severity] - RISK_SEVERITY_RANK[a.severity])[0];
}

function selectNextMilestone(milestones: Milestone[]): Milestone | undefined {
  return milestones
    .filter((milestone) => milestone.status !== 'reached')
    .sort((a, b) => MILESTONE_STATUS_RANK[b.status] - MILESTONE_STATUS_RANK[a.status])[0];
}

// One assembled view-model row per customer, built entirely from repository data —
// no raw data/* import here, no hand-typed scores, no invented risks/milestones.
export function getPortfolioTableRows(): PortfolioTableRow[] {
  return getCustomers().map((customer) => ({
    customer,
    snapshot: getLatestHealthSnapshot(customer.id),
    primaryRisk: selectPrimaryRisk(getRisksForCustomer(customer.id)),
    nextMilestone: selectNextMilestone(getMilestonesForCustomer(customer.id)),
  }));
}

export interface PortfolioReadoutItem {
  id: string;
  customerId?: string;
  statement: string;
}

// A small, seeded set of executive observations for v0.1 — WHICH accounts to call
// out is editorial judgment, but every number in the statement is pulled live from
// the repository/health engine, never hand-typed, so it can't drift from the data.
export function getPortfolioReadout(): PortfolioReadoutItem[] {
  const items = [siemensBenchmarkReadout(), balleImprovingReadout(), fibropticaRoleReadout()];
  return items.filter((item): item is PortfolioReadoutItem => item !== undefined);
}

function siemensBenchmarkReadout(): PortfolioReadoutItem | undefined {
  const snapshot = getLatestHealthSnapshot('siemens');
  if (!snapshot) return undefined;
  return {
    id: 'readout-siemens-benchmark',
    customerId: 'siemens',
    statement: `Siemens is the portfolio benchmark: ${LIFECYCLE_LABELS[snapshot.lifecycle]} lifecycle at ${snapshot.finalScore} (${STATUS_LABELS[snapshot.finalStatus]}), with ${snapshot.expansionReadiness ?? 'unassessed'} expansion readiness.`,
  };
}

function balleImprovingReadout(): PortfolioReadoutItem | undefined {
  const snapshot = getLatestHealthSnapshot('grupo-balle');
  if (!snapshot) return undefined;
  return {
    id: 'readout-balle-improving',
    customerId: 'grupo-balle',
    statement: `Grupo Balle is ${STATUS_LABELS[snapshot.finalStatus]} (${snapshot.finalScore}) but ${TREND_LABELS[snapshot.trend].toLowerCase()} as recent workflow usage strengthens.`,
  };
}

function fibropticaRoleReadout(): PortfolioReadoutItem | undefined {
  const customer = getCustomerById('fibroptica');
  if (!customer || customer.users.active === undefined) return undefined;
  return {
    id: 'readout-fibroptica-roles',
    customerId: 'fibroptica',
    statement: `Fibroptica's main open question is required-role activation: only ${customer.users.active} of ${customer.users.total} users are active.`,
  };
}
