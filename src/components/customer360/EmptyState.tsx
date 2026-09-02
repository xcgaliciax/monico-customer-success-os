export type EmptyStateVariant = 'no_instrumented' | 'insufficient_history';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  /** The variable slot inside the fixed copy template, e.g. "25 asientos, 15 con actividad". */
  detail?: string;
}

const COPY: Record<EmptyStateVariant, { title: string; body: (detail?: string) => string; tag: string }> = {
  no_instrumented: {
    title: 'Telemetría por usuario no disponible',
    body: (detail) =>
      `En v0.1 sólo conocemos el agregado: ${detail ?? 'sin dato agregado'}. El detalle por usuario, rol y última actividad se poblará cuando la telemetría esté conectada.`,
    tag: 'DESCONOCIDO · PENDIENTE DE INSTRUMENTACIÓN',
  },
  insufficient_history: {
    title: 'Histórico insuficiente para tendencia',
    body: () =>
      'Este es el primer snapshot aprobado de la cuenta. Usuarios activos, proyectos, outputs y uso por módulo se graficarán cuando existan al menos dos periodos comparables.',
    tag: '',
  },
};

// Spec §13: fixed copy and treatment per state — never "0", never a dash without
// explanation. The state always says why.
export function EmptyState({ variant, detail }: EmptyStateProps) {
  const copy = COPY[variant];
  return (
    <div className="rounded-xl border border-dashed border-grey-4 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-ink">{copy.title}</p>
      <p className="mx-auto mt-2 max-w-md text-[13px] text-grey-5">{copy.body(detail)}</p>
      {copy.tag && (
        <p className="mt-3 font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-grey-5">{copy.tag}</p>
      )}
    </div>
  );
}
