import { useParams } from 'react-router-dom';
import { HealthDimensionTable } from '../../components/customer360/HealthDimensionTable';
import { NextAction } from '../../components/customer360/NextAction';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { buildCustomerHealthView } from '../../lib/customer360';
import { getNextActionsForCustomer } from '../../services/customerRepository';
import { DIMENSION_LABELS_ES, STATUS_LABELS_ES } from '../../lib/labels';

export function SaludPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerHealthView(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Salud detallada no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { header, dimensionEvidence, highlights, hasNumericTrendHistory, override } = viewModel;
  const snapshot = header.snapshot!;
  const [nextAction] = getNextActionsForCustomer(header.customer.id);
  const evidenceHref = `/customers/${header.customer.id}/evidence`;

  return (
    <div className="space-y-11">
      <div className="grid grid-cols-1 gap-x-[72px] gap-y-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <div>
            <SectionHeader eyebrow="Composición del HealthScore" action={{ label: 'Ver evidencia', href: evidenceHref }} />
            <div className="mt-4">
              <HealthDimensionTable
                contributions={snapshot.contributions}
                evidenceHref={evidenceHref}
                showContribution
                footerNote={`Pesos congelados v0.1 · el estado ${STATUS_LABELS_ES[snapshot.finalStatus]} lo aprueba una persona`}
              />
            </div>
          </div>

          <div className="border-t border-grey-3 pt-8">
            <SectionHeader eyebrow="Evidencia principal por dimensión" />
            <div className="mt-4 divide-y divide-grey-2">
              {dimensionEvidence.map(({ dimension, topEvidence }) => (
                <div key={dimension} className="grid grid-cols-[220px_1fr] gap-6 py-3">
                  <span className="text-sm font-medium text-ink">{DIMENSION_LABELS_ES[dimension]}</span>
                  <span className="text-sm text-grey-6">{topEvidence ? topEvidence.statement : 'Sin evidencia directa vinculada todavía.'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeader eyebrow="Estado de aprobación" />
            <p className="mt-3 text-sm text-grey-6">
              {snapshot.approved ? 'Aprobado' : 'Pendiente de aprobación'}
              {snapshot.approvedBy ? ` por ${snapshot.approvedBy}` : ''}
              {snapshot.approvedAt ? ` · ${snapshot.approvedAt}` : ''}
            </p>
          </div>

          {override && (
            <div className="border-t border-grey-3 pt-6">
              <SectionHeader eyebrow="Override aplicado" />
              <p className="mt-3 text-sm font-semibold text-ink">{override.type}</p>
              <p className="mt-1 text-sm text-grey-6">{override.reason}</p>
              {override.finalScore !== undefined && <p className="mt-1 text-xs text-grey-5">Puntaje final: {override.finalScore}</p>}
              {override.finalStatus && <p className="text-xs text-grey-5">Estado final: {STATUS_LABELS_ES[override.finalStatus]}</p>}
            </div>
          )}

          <div className="border-t border-grey-3 pt-6">
            <SectionHeader eyebrow="Qué ayuda al puntaje" />
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              {highlights.helping.map((c) => (
                <li key={c.dimension}>{DIMENSION_LABELS_ES[c.dimension]} — {c.score}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader eyebrow="Qué limita el puntaje" />
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              {highlights.limiting.map((c) => (
                <li key={c.dimension}>{DIMENSION_LABELS_ES[c.dimension]} — {c.score}</li>
              ))}
            </ul>
          </div>

          {!hasNumericTrendHistory && (
            <div className="border-t border-grey-3 pt-6">
              <p className="text-sm text-grey-5">Histórico insuficiente para tendencia numérica.</p>
            </div>
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
