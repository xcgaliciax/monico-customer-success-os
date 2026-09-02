import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../components/customer360/DataTable';
import { SectionHeader } from '../components/customer360/SectionHeader';
import { formatArrCompact } from '../lib/formatters';
import { CONFIDENCE_LABELS_ES, LIFECYCLE_LABELS_ES, STATUS_BADGE_COLOR, STATUS_LABELS_ES, TREND_LABELS_ES } from '../lib/labels';
import { getPortfolioTableRows, type PortfolioTableRow } from '../lib/portfolio';
import type { HealthStatus, Lifecycle } from '../types/health';

const LIFECYCLES = Object.keys(LIFECYCLE_LABELS_ES) as Lifecycle[];
const STATUSES: HealthStatus[] = ['green', 'yellow', 'red'];

export function AccountsPage() {
  const rows = getPortfolioTableRows();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | Lifecycle>('all');

  const filteredRows = rows.filter((row) => {
    if (search && !row.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && row.snapshot?.finalStatus !== statusFilter) return false;
    if (lifecycleFilter !== 'all' && row.snapshot?.lifecycle !== lifecycleFilter) return false;
    return true;
  });

  const columns: DataTableColumn<PortfolioTableRow>[] = [
    { key: 'account', header: 'Cuenta', widthClassName: 'w-40', render: (row) => <span className="font-semibold text-ink">{row.customer.name}</span> },
    {
      key: 'health',
      header: 'Health',
      widthClassName: 'w-32',
      render: (row) =>
        row.snapshot ? (
          <Badge color={STATUS_BADGE_COLOR[row.snapshot.finalStatus]}>
            {row.snapshot.finalScore} {STATUS_LABELS_ES[row.snapshot.finalStatus]}
          </Badge>
        ) : (
          <span className="text-grey-5">—</span>
        ),
    },
    {
      key: 'trend',
      header: 'Tendencia',
      widthClassName: 'w-28',
      render: (row) =>
        row.snapshot ? (
          <span className="text-health-green">
            {TREND_LABELS_ES[row.snapshot.trend].arrow} {TREND_LABELS_ES[row.snapshot.trend].label}
          </span>
        ) : (
          <span className="text-grey-5">—</span>
        ),
    },
    {
      key: 'confidence',
      header: 'Confianza',
      widthClassName: 'w-24',
      render: (row) => <span className="text-grey-6">{row.snapshot ? CONFIDENCE_LABELS_ES[row.snapshot.confidence] : '—'}</span>,
    },
    {
      key: 'lifecycle',
      header: 'Lifecycle',
      widthClassName: 'w-40',
      render: (row) => <span className="text-grey-6">{row.snapshot ? LIFECYCLE_LABELS_ES[row.snapshot.lifecycle] : '—'}</span>,
    },
    {
      key: 'adoption',
      header: 'Adopción',
      widthClassName: 'w-28',
      render: (row) => <span className="text-grey-6">{row.adoptionLevelLabel ?? '—'}</span>,
    },
    {
      key: 'arr',
      header: 'ARR',
      align: 'right',
      widthClassName: 'w-28',
      render: (row) => <span className="text-grey-6">{formatArrCompact(row.customer.arrUsd)}</span>,
    },
    {
      key: 'attention',
      header: 'Atención principal',
      render: (row) => <span className="text-grey-6">{row.primaryAttention ? row.primaryAttention.shortTitle ?? row.primaryAttention.title : 'Sin riesgo material'}</span>,
    },
    {
      key: 'milestone',
      header: 'Próximo hito',
      render: (row) => <span className="text-grey-6">{row.nextMilestoneLabel ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-16 pt-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">Cuentas</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar cuenta…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-56 rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-grey-5"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | HealthStatus)}
          className="rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">Todo Health</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS_ES[status]}
            </option>
          ))}
        </select>
        <select
          value={lifecycleFilter}
          onChange={(event) => setLifecycleFilter(event.target.value as 'all' | Lifecycle)}
          className="rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">Todo Lifecycle</option>
          {LIFECYCLES.map((lifecycle) => (
            <option key={lifecycle} value={lifecycle}>
              {LIFECYCLE_LABELS_ES[lifecycle]}
            </option>
          ))}
        </select>
      </div>

      <SectionHeader eyebrow={`${filteredRows.length} de ${rows.length} cuentas`} />
      <DataTable columns={columns} rows={filteredRows} getRowKey={(row) => row.customer.id} getRowHref={(row) => `/customers/${row.customer.id}`} emptyLabel="Sin cuentas para este filtro." />
    </div>
  );
}
