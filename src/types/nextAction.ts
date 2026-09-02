// "Qué sigue" (Resumen, featured panel) / "Siguiente acción" (deep tabs, closing
// line) — spec §17: "Eyebrow + una frase; cierra toda pestaña profunda."
export type NextActionScope = 'summary' | 'health' | 'adoption' | 'value' | 'risks';

export interface NextAction {
  id: string;
  customerId: string;
  scope: NextActionScope;
  headline: string;
  meta?: string; // e.g. "10 países · preparación para expansión alta"
  relatedMilestoneId?: string;
}
