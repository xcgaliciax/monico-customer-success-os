import { CustomerTable } from '../components/portfolio/CustomerTable';
import { ExecutiveSummary } from '../components/portfolio/ExecutiveSummary';
import { PortfolioReadout } from '../components/portfolio/PortfolioReadout';
import { formatDate } from '../lib/formatters';
import {
  getPortfolioReadout,
  getPortfolioSnapshotDate,
  getPortfolioSummary,
  getPortfolioTableRows,
} from '../lib/portfolio';

export function PortfolioHealth() {
  const summary = getPortfolioSummary();
  const rows = getPortfolioTableRows();
  const readout = getPortfolioReadout();
  const snapshotDate = getPortfolioSnapshotDate();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Customer Success OS</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Portfolio Health</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Current customer health, adoption, risk and next actions across the monico portfolio.
          </p>
        </div>
        {snapshotDate && (
          <p className="text-xs font-medium text-muted">
            Snapshot as of <span className="text-ink-soft">{formatDate(snapshotDate)}</span>
          </p>
        )}
      </header>

      <ExecutiveSummary summary={summary} />
      <CustomerTable rows={rows} />
      <PortfolioReadout items={readout} />
    </div>
  );
}
