interface NextActionProps {
  variant: 'panel' | 'inline';
  eyebrow: string;
  headline: string;
  meta?: string;
}

// Spec §17: "Eyebrow + una frase; cierra toda pestaña profunda." The Resumen "Qué
// sigue" panel and a deep tab's closing "Siguiente acción" line are the same
// component in two variants — the sentence never competes with a card of its own
// in the inline form.
export function NextAction({ variant, eyebrow, headline, meta }: NextActionProps) {
  if (variant === 'inline') {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">{eyebrow}</p>
        <p className="mt-2 text-[15px] leading-[1.5] text-ink">{headline}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-monico-blue-soft px-6 py-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-monico-blue">{eyebrow}</p>
      <p className="mt-2 text-2xl font-extrabold leading-tight text-ink">{headline}</p>
      {meta && <p className="mt-1 text-sm text-grey-6">{meta}</p>}
    </div>
  );
}
