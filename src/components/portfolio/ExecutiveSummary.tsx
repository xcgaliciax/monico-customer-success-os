import { formatArrCompact } from '../../lib/formatters';
import type { PortfolioSummary } from '../../lib/portfolio';

interface ExecutiveSummaryProps {
  summary: PortfolioSummary;
}

// Compact statistic strip, not cards — a single hairline-divided row so the eye can
// take in ARR, portfolio composition and count in one pass.
export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  const stats: Array<{ label: string; value: string; emphasis?: boolean; colorClass?: string }> = [
    { label: 'Portfolio ARR', value: formatArrCompact(summary.totalArrUsd), emphasis: true },
    { label: 'Accounts', value: String(summary.accountCount) },
    { label: 'Green', value: String(summary.statusCounts.green), colorClass: 'text-health-green' },
    { label: 'Yellow', value: String(summary.statusCounts.yellow), colorClass: 'text-health-yellow' },
    { label: 'Red', value: String(summary.statusCounts.red), colorClass: 'text-health-red' },
    { label: 'Improving', value: String(summary.improvingCount) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</dt>
          <dd
            className={[
              'mt-1 tabular-nums font-semibold',
              stat.emphasis ? 'text-2xl' : 'text-xl',
              stat.colorClass ?? 'text-ink',
            ].join(' ')}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
