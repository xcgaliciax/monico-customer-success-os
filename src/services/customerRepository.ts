import { resolveHealthSnapshot } from '../lib/healthEngine';
import { commitments } from '../data/commitments';
import { customers } from '../data/customers';
import { evidence } from '../data/evidence';
import { healthSnapshotInputs } from '../data/healthSnapshots';
import { milestones } from '../data/milestones';
import { risks } from '../data/risks';
import type { Commitment } from '../types/commitment';
import type { Customer } from '../types/customer';
import type { Evidence } from '../types/evidence';
import type { HealthSnapshot } from '../types/healthSnapshot';
import type { Milestone } from '../types/milestone';
import type { Risk } from '../types/risk';

// The ONLY module that reads from src/data/*. Every consumer (pages, lib/portfolio.ts)
// must go through these functions so that swapping local arrays for a real API later
// means rewriting this file only.

export function getCustomers(): Customer[] {
  return customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function getHealthSnapshotsForCustomer(customerId: string): HealthSnapshot[] {
  return healthSnapshotInputs
    .filter((snapshot) => snapshot.customerId === customerId)
    .map(resolveHealthSnapshot)
    .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
}

export function getLatestHealthSnapshot(customerId: string): HealthSnapshot | undefined {
  const snapshots = getHealthSnapshotsForCustomer(customerId);
  return snapshots[snapshots.length - 1];
}

export function getEvidenceForCustomer(customerId: string): Evidence[] {
  return evidence.filter((item) => item.customerId === customerId);
}

export function getRisksForCustomer(customerId: string): Risk[] {
  return risks.filter((risk) => risk.customerId === customerId);
}

export function getCommitmentsForCustomer(customerId: string): Commitment[] {
  return commitments.filter((commitment) => commitment.customerId === customerId);
}

export function getMilestonesForCustomer(customerId: string): Milestone[] {
  return milestones.filter((milestone) => milestone.customerId === customerId);
}
