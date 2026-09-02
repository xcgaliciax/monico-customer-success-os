interface PlaceholderPageProps {
  eyebrow?: string;
  title: string;
  message: string;
}

// Minimal, restrained stand-in for screens not built yet in this phase.
export function PlaceholderPage({ eyebrow, title, message }: PlaceholderPageProps) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
