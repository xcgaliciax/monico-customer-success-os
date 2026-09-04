import { useParams } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '../../components/customer360/DataTable';
import { NextAction } from '../../components/customer360/NextAction';
import { ProvenanceLabel } from '../../components/customer360/ProvenanceLabel';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { ValueMetric } from '../../components/customer360/ValueMetric';
import { buildCustomerValueView, type ValueEvidenceRow } from '../../lib/customer360';
import { getNextActionsForCustomer } from '../../services/customerRepository';
import { formatMonoDateShort } from '../../lib/formatters';

export function ValorPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerValueView(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Valor detallado no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { header, executiveMetrics, evidenceRows } = viewModel;
  const [nextAction] = getNextActionsForCustomer(header.customer.id, 'summary');

  const columns: DataTableColumn<ValueEvidenceRow>[] = [
    { key: 'category', header: 'Tipo', widthClassName: 'w-40', render: (row) => <span className="text-grey-6">{row.evidence.category}</span> },
    { key: 'statement', header: 'Enunciado', render: (row) => row.evidence.statement },
    { key: 'source', header: 'Fuente', widthClassName: 'w-44', render: (row) => <span className="text-grey-6">{row.evidence.source}</span> },
    {
      key: 'date',
      header: 'Fecha',
      widthClassName: 'w-32',
      render: (row) => <span className="font-mono text-xs text-grey-5">{formatMonoDateShort(row.evidence.sourceDate)}</span>,
    },
    { key: 'provenance', header: 'Procedencia', align: 'right', widthClassName: 'w-48', render: (row) => <ProvenanceLabel provenance={row.provenance} /> },
  ];

  return (
    <div className="space-y-11">
      {executiveMetrics.length > 0 && (
        <div>
          <SectionHeader eyebrow="Anclajes ejecutivos" />
          <div className="mt-4 grid grid-cols-1 divide-y divide-grey-2 border-t border-grey-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {executiveMetrics.map((metric) => (
              <ValueMetric key={metric.id} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>
      )}

      <div className={executiveMetrics.length > 0 ? 'border-t border-grey-3 pt-8' : undefined}>
        <SectionHeader eyebrow="Evidencia de valor" />
        <div className="mt-4">
          {evidenceRows.length > 0 ? (
            <DataTable columns={columns} rows={evidenceRows} getRowKey={(row) => row.evidence.id} />
          ) : (
            <p className="text-sm text-grey-5">No existe evidencia cuantificada de valor todavía.</p>
          )}
        </div>
      </div>

      {nextAction && (
        <div className="border-t border-grey-3 pt-8">
          <NextAction variant="inline" eyebrow="Siguiente acción" headline={nextAction.headline} />
        </div>
      )}
    </div>
  );
}
