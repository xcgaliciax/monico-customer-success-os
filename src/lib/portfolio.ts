import {
  getCustomerById,
  getCustomers,
  getLatestHealthSnapshot,
  getMilestonesForCustomer,
  getNextActionsForCustomer,
  getRisksForCustomer,
} from '../services/customerRepository';
import { selectAttentionRisks } from './customerIntelligence';
import { deriveAdoptionLevelLabel } from './customer360/shared';
import { LIFECYCLE_LABELS_ES, STATUS_LABELS_ES, TREND_LABELS_ES } from './labels';
import type { HealthStatus } from '../types/health';
import type { HealthSnapshot } from '../types/healthSnapshot';
import type { Customer } from '../types/customer';
import type { Milestone } from '../types/milestone';
import type { Risk } from '../types/risk';

// Cross-customer aggregation only. No scoring math happens here — that's healthEngine's
// job. This module calls the repository, never src/data/* directly.

export interface PortfolioSummary {
  accountCount: number;
  totalArrUsd: number;
  statusCounts: Record<HealthStatus, number>;
  arrByStatus: Record<HealthStatus, number>;
  improvingCount: number;
}

export function getPortfolioSummary(): PortfolioSummary {
  const customers = getCustomers();
  const statusCounts: Record<HealthStatus, number> = { green: 0, yellow: 0, red: 0 };
  const arrByStatus: Record<HealthStatus, number> = { green: 0, yellow: 0, red: 0 };
  let improvingCount = 0;
  let totalArrUsd = 0;

  for (const customer of customers) {
    totalArrUsd += customer.arrUsd;
    const snapshot = getLatestHealthSnapshot(customer.id);
    if (!snapshot) continue;
    statusCounts[snapshot.finalStatus] += 1;
    arrByStatus[snapshot.finalStatus] += customer.arrUsd;
    if (snapshot.trend === 'improving') improvingCount += 1;
  }

  return { accountCount: customers.length, totalArrUsd, statusCounts, arrByStatus, improvingCount };
}

export interface ModuleAdoption {
  module: string;
  accountsUsing: number;
  totalAccounts: number;
}

// Derived cross-account product-usage pattern (used by Señales) — computed from
// Customer.modulesUsed, never hand-authored prose.
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
  adoptionLevelLabel: string | undefined;
  primaryAttention: Risk | undefined;
  nextMilestoneLabel: string | undefined;
}

const MILESTONE_STATUS_RANK: Record<Milestone['status'], number> = { in_progress: 2, planned: 1, reached: 0 };

function selectNextMilestone(milestones: Milestone[]): Milestone | undefined {
  return milestones
    .filter((milestone) => milestone.status !== 'reached')
    .sort((a, b) => MILESTONE_STATUS_RANK[b.status] - MILESTONE_STATUS_RANK[a.status])[0];
}

// One assembled view-model row per customer, built entirely from repository data —
// no raw data/* import here, no hand-typed scores, no invented risks/milestones.
// The milestone label prefers the account's Spanish NextAction headline (product
// language is Spanish LATAM) — Milestone.title itself stays the Phase 1 canonical
// English field, unrelated to display language.
export function getPortfolioTableRows(): PortfolioTableRow[] {
  return getCustomers().map((customer) => {
    const snapshot = getLatestHealthSnapshot(customer.id);
    const nextAction = getNextActionsForCustomer(customer.id, 'summary')[0];
    const nextMilestone = selectNextMilestone(getMilestonesForCustomer(customer.id));
    return {
      customer,
      snapshot,
      adoptionLevelLabel: snapshot ? deriveAdoptionLevelLabel(snapshot.dimensions.workflowAdoption) : undefined,
      primaryAttention: selectAttentionRisks(getRisksForCustomer(customer.id))[0],
      nextMilestoneLabel: nextAction?.headline ?? nextMilestone?.title,
    };
  });
}

// Accounts requiring attention right now — mirrors Customer Intelligence's
// canonical selectAttentionRisks so Panel and Customer Intelligence can never
// disagree on which accounts need attention. This is Risk-based, not
// HealthScore-based: an account only appears here if it has at least one
// open/monitoring Risk, regardless of its HealthScore color.
export function getAttentionAccounts(): PortfolioTableRow[] {
  return getPortfolioTableRows().filter((row) => Boolean(row.snapshot) && Boolean(row.primaryAttention));
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
  const items = [siemensBenchmarkReadout(), balleImprovingReadout(), manprecMomentumReadout(), fibropticaAdoptionReadout()];
  return items.filter((item): item is PortfolioReadoutItem => item !== undefined);
}

function siemensBenchmarkReadout(): PortfolioReadoutItem | undefined {
  const snapshot = getLatestHealthSnapshot('siemens');
  if (!snapshot) return undefined;
  return {
    id: 'readout-siemens-benchmark',
    customerId: 'siemens',
    statement: `Siemens es la cuenta de referencia del portafolio: valor verificado y adopción independiente, con ${LIFECYCLE_LABELS_ES[snapshot.lifecycle].toLowerCase()} confirmado.`,
  };
}

function balleImprovingReadout(): PortfolioReadoutItem | undefined {
  const snapshot = getLatestHealthSnapshot('grupo-balle');
  if (!snapshot) return undefined;
  return {
    id: 'readout-balle-improving',
    customerId: 'grupo-balle',
    statement: `Grupo Balle está ${TREND_LABELS_ES[snapshot.trend].label.toLowerCase()} tras los retrasos de implementación, con actividad de flujo más fuerte en semanas recientes.`,
  };
}

function manprecMomentumReadout(): PortfolioReadoutItem | undefined {
  const snapshot = getLatestHealthSnapshot('manprec');
  if (!snapshot) return undefined;
  return {
    id: 'readout-manprec-momentum',
    customerId: 'manprec',
    statement: `Manprec muestra un momentum fuerte de implementación a adopción, con ${STATUS_LABELS_ES[snapshot.finalStatus].toLowerCase()} (${snapshot.finalScore}) aun en etapas tempranas.`,
  };
}

function fibropticaAdoptionReadout(): PortfolioReadoutItem | undefined {
  const customer = getCustomerById('fibroptica');
  if (!customer || customer.users.active === undefined) return undefined;
  return {
    id: 'readout-fibroptica-adoption-breadth',
    customerId: 'fibroptica',
    statement: `Fibroptica ha demostrado valor de producto, pero la amplitud de adopción sigue siendo la pregunta abierta: sólo ${customer.users.active} de ${customer.users.total} usuarios están activos.`,
  };
}
