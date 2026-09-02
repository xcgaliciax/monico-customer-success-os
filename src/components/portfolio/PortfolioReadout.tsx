import type { PortfolioReadoutItem } from '../../lib/portfolio';

export function PortfolioReadout({ items }: { items: PortfolioReadoutItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="portfolio-readout-heading" className="rounded-lg border border-border bg-surface px-6 py-5">
      <h2 id="portfolio-readout-heading" className="text-sm font-semibold text-ink">
        Portfolio readout
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2.5 text-sm text-ink-soft">
            <span aria-hidden="true" className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
            <span>{item.statement}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
