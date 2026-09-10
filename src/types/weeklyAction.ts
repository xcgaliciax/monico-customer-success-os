// A planned/tracked CS or Commercial action for a specific week, with its
// expected and actual result. Distinct from NextAction (types/nextAction.ts),
// which is the curated "what's next" headline shown on Customer 360 — a
// WeeklyAction is a dated, owned commitment for one specific week with a
// preserved outcome, not a rolling summary line.
export type WeeklyActionStatus = 'planned' | 'achieved' | 'partial' | 'not_achieved' | 'cancelled';

export interface WeeklyAction {
  id: string;
  weekOf: string; // ISO date — start of the week this action belongs to
  customerId: string;
  owner: string;
  action: string;
  expectedResult: string;
  dueDate?: string; // ISO date
  status: WeeklyActionStatus;
  actualResult?: string; // omitted until the action is closed out
  resultNote?: string;
}
