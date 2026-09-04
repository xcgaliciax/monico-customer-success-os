// "Qué sigue" (Resumen, featured panel) / "Siguiente acción" (deep tabs, closing
// line) — spec §17: "Eyebrow + una frase; cierra toda pestaña profunda."
// 'risk' and 'opportunity' are item-level scopes: they mark a NextAction as the
// curated recommended action for one specific Risk/Insight (Customer Intelligence
// attention/opportunity items), not a tab-level "current next step". Callers that
// want the account's single tab-level action must pass scope: 'summary' explicitly
// now that a customer can have more than one NextAction record.
export type NextActionScope = 'summary' | 'health' | 'adoption' | 'value' | 'risks' | 'risk' | 'opportunity';

export interface NextAction {
  id: string;
  customerId: string;
  scope: NextActionScope;
  headline: string;
  meta?: string; // e.g. "10 países · preparación para expansión alta"
  relatedMilestoneId?: string;
  // Explicit, typed link from a curated action back to the specific Risk or
  // Insight it answers — read by getNextActionForRisk/getNextActionForInsight.
  // A NextAction may reuse an existing record's id here rather than duplicating
  // the same recommendation in a second record.
  relatedRiskId?: string;
  relatedInsightId?: string;
}
