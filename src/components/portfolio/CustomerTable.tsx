import { CustomerTableRow } from './CustomerTableRow';
import type { PortfolioTableRow } from '../../lib/portfolio';

const COLUMNS = [
  { key: 'account', label: 'Account', align: 'left' as const },
  { key: 'health', label: 'Health', align: 'left' as const },
  { key: 'trend', label: 'Trend', align: 'left' as const },
  { key: 'confidence', label: 'Confidence', align: 'left' as const },
  { key: 'lifecycle', label: 'Lifecycle', align: 'left' as const },
  { key: 'arr', label: 'ARR', align: 'right' as const },
  { key: 'risk', label: 'Primary Risk', align: 'left' as const },
  { key: 'milestone', label: 'Next Milestone', align: 'left' as const },
];

export function CustomerTable({ rows }: { rows: PortfolioTableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[880px] border-collapse">
        <thead>
          <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CustomerTableRow key={row.customer.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
