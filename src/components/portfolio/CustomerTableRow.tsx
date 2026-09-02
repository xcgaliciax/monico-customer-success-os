import { Link, useNavigate } from 'react-router-dom';
import { ConfidenceTag } from '../shared/ConfidenceTag';
import { HealthBadge } from '../shared/HealthBadge';
import { LifecycleTag } from '../shared/LifecycleTag';
import { TrendIndicator } from '../shared/TrendIndicator';
import { formatCurrency } from '../../lib/formatters';
import type { PortfolioTableRow as PortfolioTableRowModel } from '../../lib/portfolio';

function EmptyCell({ label }: { label: string }) {
  return <span className="text-muted">{label}</span>;
}

interface CustomerTableRowProps {
  row: PortfolioTableRowModel;
}

// The whole row is a mouse-click affordance; the account name is a real <Link>, so
// keyboard/tab users reach the same destination via native anchor semantics.
export function CustomerTableRow({ row }: CustomerTableRowProps) {
  const navigate = useNavigate();
  const { customer, snapshot, primaryRisk, nextMilestone } = row;
  const href = `/customers/${customer.id}`;

  return (
    <tr
      onClick={() => navigate(href)}
      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-soft"
    >
      <th scope="row" className="px-4 py-3 text-left text-sm font-medium text-ink">
        <Link
          to={href}
          onClick={(event) => event.stopPropagation()}
          className="rounded-sm outline-none focus-visible:underline focus-visible:decoration-accent focus-visible:decoration-2"
        >
          {customer.name}
        </Link>
      </th>
      <td className="px-4 py-3">
        {snapshot ? <HealthBadge score={snapshot.finalScore} status={snapshot.finalStatus} /> : <EmptyCell label="—" />}
      </td>
      <td className="px-4 py-3">{snapshot ? <TrendIndicator trend={snapshot.trend} /> : <EmptyCell label="—" />}</td>
      <td className="px-4 py-3">
        {snapshot ? <ConfidenceTag confidence={snapshot.confidence} /> : <EmptyCell label="—" />}
      </td>
      <td className="px-4 py-3">
        {snapshot ? <LifecycleTag lifecycle={snapshot.lifecycle} /> : <EmptyCell label="—" />}
      </td>
      <td className="px-4 py-3 text-right text-sm tabular-nums text-ink-soft">
        {formatCurrency(customer.arrUsd)}
      </td>
      <td className="px-4 py-3 text-sm text-ink-soft">
        {primaryRisk ? primaryRisk.title : <EmptyCell label="No material risk recorded" />}
      </td>
      <td className="px-4 py-3 text-sm text-ink-soft">
        {nextMilestone ? nextMilestone.title : <EmptyCell label="No milestone recorded" />}
      </td>
    </tr>
  );
}
