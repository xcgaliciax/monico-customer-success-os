// An owned, trackable CS action — covers "recommended CS intervention" as data
// rather than a free-text field on Customer.
export interface Commitment {
  id: string;
  customerId: string;
  description: string;
  owner: string;
  dueDate?: string; // ISO date
  status: 'planned' | 'in_progress' | 'done';
  sourceEvidenceId?: string;
}
