// Spec §11 "Forma ejecutiva (Resumen)": one of up to three executive value anchors
// in a three-column grid with a top hairline and vertical dividers. No source, no
// date, no badge here — the section's "Ver toda la evidencia" link carries the rest.
export function ValueMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-8 py-[22px] first:pl-0 last:pr-0">
      <div className="text-[52px] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-ink">{value}</div>
      <p className="mt-3 text-[15px] text-grey-6">{label}</p>
    </div>
  );
}
