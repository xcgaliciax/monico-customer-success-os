import { useParams } from 'react-router-dom';
import { InsightList } from '../../components/customer360/InsightList';
import { HealthDimensionTable } from '../../components/customer360/HealthDimensionTable';
import { NextAction } from '../../components/customer360/NextAction';
import { RiskRow } from '../../components/customer360/RiskRow';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { Timeline } from '../../components/customer360/Timeline';
import { ValueMetric } from '../../components/customer360/ValueMetric';
import { getResumenViewModel } from '../../lib/customer360';

export function ResumenPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? getResumenViewModel(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Resumen detallado no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const { header, whyScoreInsights, nextAction, attentionRisk, dimensionContributions, dimensionFooterNote, timelineEvents, valueMetrics, adoptionSummary, commercialSummary } = viewModel;
  const evidenceHref = `/customers/${header.customer.id}/evidencia`;

  return (
    <div className="space-y-11">
      <div className="grid grid-cols-1 gap-x-[72px] gap-y-10 lg:grid-cols-[1fr_420px]">
        {/* Main column */}
        <div className="space-y-8">
          <div>
            <SectionHeader eyebrow="Por qué este puntaje" />
            <InsightList
              items={whyScoreInsights.map((insight) => ({
                id: insight.id,
                statement: insight.statement,
                context: insight.context,
                href: evidenceHref,
              }))}
            />
          </div>
          <div className="border-t border-grey-3 pt-8">
            <SectionHeader eyebrow="Composición del HealthScore" action={{ label: 'Ver salud', href: `/customers/${header.customer.id}/salud` }} />
            <div className="mt-4">
              <HealthDimensionTable contributions={dimensionContributions} footerNote={dimensionFooterNote} evidenceHref={`/customers/${header.customer.id}/salud`} />
            </div>
          </div>
        </div>

        {/* Secondary column */}
        <div className="space-y-6">
          {nextAction && <NextAction variant="panel" eyebrow="Qué sigue" headline={nextAction.headline} meta={nextAction.meta} />}
          {attentionRisk && (
            <div>
              <SectionHeader eyebrow="Atención" />
              <div className="mt-3">
                <RiskRow
                  title={attentionRisk.shortTitle ?? attentionRisk.title}
                  cause={attentionRisk.shortCause ?? attentionRisk.description}
                  dependencyTypeLabel={attentionRisk.dependencyTypeLabel}
                  severityLabel="Severidad baja"
                  healthImpactStatement={attentionRisk.healthImpactStatement}
                  href={`/customers/${header.customer.id}/riesgos`}
                />
              </div>
            </div>
          )}
          <div className="border-t border-grey-3 pt-6">
            <SectionHeader eyebrow="Qué cambió" action={{ label: 'Ver historial', href: `/customers/${header.customer.id}/historial` }} />
            <Timeline events={timelineEvents} hrefFor={() => evidenceHref} />
          </div>
        </div>
      </div>

      <div className="border-t border-grey-3 pt-8">
        <SectionHeader eyebrow="Valor" action={{ label: 'Ver toda la evidencia', href: evidenceHref }} />
        <div className="mt-4 grid grid-cols-1 divide-y divide-grey-2 border-t border-grey-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {valueMetrics.map((metric) => (
            <ValueMetric key={metric.id} value={metric.value} label={metric.label} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-[72px] gap-y-8 border-t border-grey-3 pt-8 sm:grid-cols-2">
        {adoptionSummary && (
          <div>
            <SectionHeader eyebrow="Adopción" action={{ label: 'Ver adopción y uso', href: `/customers/${header.customer.id}/adopcion` }} />
            <p className="mt-3 text-2xl font-extrabold text-ink">{adoptionSummary.levelLabel}</p>
            <p className="mt-1 text-sm text-grey-6">
              {adoptionSummary.activeUsersLabel} · {adoptionSummary.workflowCoverageLabel} · {adoptionSummary.independentOperationLabel}
            </p>
          </div>
        )}
        {commercialSummary && (
          <div>
            <SectionHeader eyebrow="Comercial" action={{ label: 'Ver comercial', href: `/customers/${header.customer.id}/comercial` }} />
            <p className="mt-3 text-2xl font-extrabold text-ink">{commercialSummary.arrLabel}</p>
            <p className="mt-1 text-sm text-grey-6">
              {[
                commercialSummary.renewalConfirmed ? 'Renovación confirmada' : undefined,
                commercialSummary.paymentWindowLabel ? `pago ${commercialSummary.paymentWindowLabel}` : undefined,
                commercialSummary.expansionReadinessLabel ? `expansión ${commercialSummary.expansionReadinessLabel}` : undefined,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
