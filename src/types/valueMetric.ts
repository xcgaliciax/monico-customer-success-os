// Executive value anchor — spec §11 "Forma ejecutiva (Resumen)". Maximum three per
// screen. Traceable to a real Evidence record; never a hand-typed number divorced
// from the evidence that supports it.
export interface ValueMetricEntry {
  id: string;
  customerId: string;
  value: string; // e.g. "-50%", "180-250", "10 países"
  label: string; // e.g. "tiempo operativo documentado"
  relatedEvidenceId?: string;
}
