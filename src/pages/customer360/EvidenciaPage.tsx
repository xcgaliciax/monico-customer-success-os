import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '../../components/customer360/DataTable';
import { ProvenanceLabel } from '../../components/customer360/ProvenanceLabel';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { buildCustomerEvidenceView, type EvidenceRow } from '../../lib/customer360';
import { formatMonoDateShort } from '../../lib/formatters';
import { CONFIDENCE_LABELS_ES, DIMENSION_LABELS_ES, EVIDENCE_TYPE_LABELS_ES, IMPACT_LABELS_ES } from '../../lib/labels';
import type { Confidence, DimensionKey } from '../../types/health';
import type { EvidenceType } from '../../types/evidence';

const DIMENSIONS = Object.keys(DIMENSION_LABELS_ES) as DimensionKey[];
const CONFIDENCES: Confidence[] = ['high', 'medium', 'low'];

export function EvidenciaPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerEvidenceView(customerId) : undefined;

  const [dimensionFilter, setDimensionFilter] = useState<'all' | DimensionKey>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EvidenceType>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | Confidence>('all');

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Evidencia no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { rows } = viewModel;
  const types = Array.from(new Set(rows.map((row) => row.evidence.type)));

  const filteredRows = rows.filter((row) => {
    if (dimensionFilter !== 'all' && row.evidence.relatedDimension !== dimensionFilter) return false;
    if (typeFilter !== 'all' && row.evidence.type !== typeFilter) return false;
    if (confidenceFilter !== 'all' && row.evidence.confidence !== confidenceFilter) return false;
    return true;
  });

  const columns: DataTableColumn<EvidenceRow>[] = [
    { key: 'id', header: 'ID', widthClassName: 'w-32', render: (row) => <span className="font-mono text-xs text-grey-5">{row.evidence.id}</span> },
    {
      key: 'date',
      header: 'Fecha',
      widthClassName: 'w-28',
      render: (row) => <span className="font-mono text-xs text-grey-5">{formatMonoDateShort(row.evidence.sourceDate)}</span>,
    },
    { key: 'statement', header: 'Enunciado', render: (row) => row.evidence.statement },
    { key: 'type', header: 'Tipo', widthClassName: 'w-48', render: (row) => <span className="text-grey-6">{EVIDENCE_TYPE_LABELS_ES[row.evidence.type]}</span> },
    { key: 'source', header: 'Fuente', widthClassName: 'w-40', render: (row) => <span className="text-grey-6">{row.evidence.source}</span> },
    {
      key: 'dimension',
      header: 'Dimensión',
      widthClassName: 'w-44',
      render: (row) => <span className="text-grey-6">{row.evidence.relatedDimension ? DIMENSION_LABELS_ES[row.evidence.relatedDimension] : '—'}</span>,
    },
    { key: 'impact', header: 'Impacto', widthClassName: 'w-24', render: (row) => <span className="text-grey-6">{IMPACT_LABELS_ES[row.evidence.impact]}</span> },
    { key: 'provenance', header: 'Procedencia', align: 'right', widthClassName: 'w-48', render: (row) => <ProvenanceLabel provenance={row.provenance} /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Registro de evidencia" note={`${filteredRows.length} de ${rows.length} registros`} />

      <div className="flex flex-wrap gap-4">
        <select
          value={dimensionFilter}
          onChange={(event) => setDimensionFilter(event.target.value as 'all' | DimensionKey)}
          className="rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">Todas las dimensiones</option>
          {DIMENSIONS.map((dimension) => (
            <option key={dimension} value={dimension}>
              {DIMENSION_LABELS_ES[dimension]}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as 'all' | EvidenceType)}
          className="rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">Todos los tipos</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {EVIDENCE_TYPE_LABELS_ES[type]}
            </option>
          ))}
        </select>
        <select
          value={confidenceFilter}
          onChange={(event) => setConfidenceFilter(event.target.value as 'all' | Confidence)}
          className="rounded-md border border-grey-3 bg-white px-3 py-1.5 text-sm text-ink"
        >
          <option value="all">Toda confianza</option>
          {CONFIDENCES.map((confidence) => (
            <option key={confidence} value={confidence}>
              Confianza {CONFIDENCE_LABELS_ES[confidence]}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={filteredRows} getRowKey={(row) => row.evidence.id} emptyLabel="Sin evidencia para este filtro." />
    </div>
  );
}
