export interface Milestone {
  id: string;
  customerId: string;
  title: string;
  status: 'planned' | 'in_progress' | 'reached';
  targetDate?: string; // ISO date
  category: string; // e.g. "expansion", "adoption"
}
