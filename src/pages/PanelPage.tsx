import { AttentionAccountRow } from '../components/panel/AttentionAccountRow';
import { Badge } from '../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../components/customer360/DataTable';
import { InsightList } from '../components/customer360/InsightList';
import { MetricGroup } from '../components/customer360/MetricGroup';
import { SectionHeader } from '../components/customer360/SectionHeader';
import { formatArrCompact, formatDate } from '../lib/formatters';
import { LIFECYCLE_LABELS_ES, STATUS_BADGE_COLOR, STATUS_LABELS_ES, TREND_LABELS_ES } from '../lib/labels';
import { getAttentionAccounts, getPortfolioReadout, getPortfolioSnapshotDate, getPortfolioSummary, getPortfolioTableRows, type PortfolioTableRow } from '../lib/portfolio';

export function PanelPage() {
  const summary = getPortfolioSummary();
  const rows = getPortfolioTableRows();
  const attentionAccounts = getAttentionAccounts();
  const readout = getPortfolioReadout();
  const snapshotDate = getPortfolioSnapshotDate();

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
    <div className="space-y-11 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">Panel</h1>
        </div>
        {snapshotDate && <p className="text-xs text-grey-5">Snapshot al {formatDate(snapshotDate)}</p>}
      </header>

      <MetricGroup
        items={[
          { value: formatArrCompact(summary.totalArrUsd), label: 'ARR del portafolio' },
          { value: String(summary.accountCount), label: 'cuentas' },
          { value: String(summary.statusCounts.green), label: 'verde', comparison: formatArrCompact(summary.arrByStatus.green) },
          { value: String(summary.statusCounts.yellow), label: 'amarillo', comparison: formatArrCompact(summary.arrByStatus.yellow) },
          { value: String(summary.statusCounts.red), label: 'rojo', comparison: summary.arrByStatus.red > 0 ? formatArrCompact(summary.arrByStatus.red) : undefined },
          { value: String(summary.improvingCount), label: 'mejorando' },
        ]}
      />

      {attentionAccounts.length > 0 && (
        <div>
          <SectionHeader eyebrow="Atención ahora" />
          <div className="mt-2 divide-y divide-grey-2">
            {attentionAccounts.map((row) => (
              <AttentionAccountRow
                key={row.customer.id}
                customer={row.customer}
                snapshot={row.snapshot!}
                focusStatement={row.primaryAttention ? row.primaryAttention.shortCause ?? row.primaryAttention.description : 'Sin riesgo material registrado.'}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeader eyebrow="Cuentas del portafolio" action={{ label: 'Ver todas las cuentas', href: '/accounts' }} />
        <div className="mt-4">
          <DataTable columns={columns} rows={rows} getRowKey={(row) => row.customer.id} getRowHref={(row) => `/customers/${row.customer.id}`} />
        </div>
      </div>

      {readout.length > 0 && (
        <div>
          <SectionHeader eyebrow="Lectura del portafolio" />
          <div className="mt-2">
            <InsightList items={readout.map((item) => ({ id: item.id, statement: item.statement, href: item.customerId ? `/customers/${item.customerId}` : undefined }))} />
          </div>
        </div>
      )}
    </div>
  );
}
