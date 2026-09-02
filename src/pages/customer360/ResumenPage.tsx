import { useParams } from 'react-router-dom';
import { InsightList } from '../../components/customer360/InsightList';
import { HealthDimensionTable } from '../../components/customer360/HealthDimensionTable';
import { NextAction } from '../../components/customer360/NextAction';
import { RiskRow } from '../../components/customer360/RiskRow';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { Timeline } from '../../components/customer360/Timeline';
import { ValueMetric } from '../../components/customer360/ValueMetric';
import { buildCustomerOverview } from '../../lib/customer360';
import { formatMonoDateShort } from '../../lib/formatters';
import { CONFIDENCE_LABELS_ES } from '../../lib/labels';

export function ResumenPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerOverview(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Resumen detallado no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const {
    header,
    whyScoreInsights,
    nextAction,
    attentionRisk,
    dimensionContributions,
    dimensionFooterNote,
    timelineEvents,
    valueDisplay,
    adoptionSummary,
    commercialSummary,
  } = viewModel;
  const customerId_ = header.customer.id;
  const evidenceHref = `/customers/${customerId_}/evidence`;

  return (
    <div className="space-y-11">
      <div className="grid grid-cols-1 gap-x-[72px] gap-y-10 lg:grid-cols-[1fr_420px]">
        {/* Main column */}
        <div className="space-y-8">
          <div>
            <SectionHeader eyebrow="Por qué este puntaje" />
            {whyScoreInsights.length > 0 ? (
              <InsightList
                items={whyScoreInsights.map((insight) => ({
                  id: insight.id,
                  statement: insight.statement,
                  context: insight.context,
                  href: evidenceHref,
                }))}
              />
            ) : (
              <p className="py-4 text-sm text-grey-5">Aún no hay drivers curados para esta cuenta.</p>
            )}
          </div>
          <div className="border-t border-grey-3 pt-8">
            <SectionHeader eyebrow="Composición del HealthScore" action={{ label: 'Ver salud', href: `/customers/${customerId_}/health` }} />
            <div className="mt-4">
              <HealthDimensionTable contributions={dimensionContributions} footerNote={dimensionFooterNote} evidenceHref={`/customers/${customerId_}/health`} />
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
                  severity={attentionRisk.severity}
                  healthImpactStatement={attentionRisk.healthImpactStatement}
                  href={`/customers/${customerId_}/risks`}
                />
              </div>
            </div>
          )}
          {!attentionRisk && (
            <div>
              <SectionHeader eyebrow="Atención" />
              <p className="mt-3 text-sm text-grey-5">No hay riesgo material registrado.</p>
            </div>
          )}
          <div className="border-t border-grey-3 pt-6">
            <SectionHeader eyebrow="Qué cambió" action={{ label: 'Ver historial', href: `/customers/${customerId_}/history` }} />
            {timelineEvents.length > 0 ? (
              <Timeline events={timelineEvents} hrefFor={() => evidenceHref} />
            ) : (
              <p className="py-4 text-sm text-grey-5">Sin eventos registrados todavía.</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-grey-3 pt-8">
        <SectionHeader eyebrow="Valor" action={{ label: 'Ver toda la evidencia', href: `/customers/${customerId_}/value` }} />
        {valueDisplay.kind === 'quantified' ? (
          <div className="mt-4 grid grid-cols-1 divide-y divide-grey-2 border-t border-grey-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {valueDisplay.metrics.map((metric) => (
              <ValueMetric key={metric.id} value={metric.value} label={metric.label} />
            ))}
          </div>
        ) : valueDisplay.evidence.length > 0 ? (
          <div className="mt-4">
            <InsightList
              items={valueDisplay.evidence.map(({ evidence, provenance }) => ({
                id: evidence.id,
                statement: evidence.statement,
                context: `${evidence.source} · ${formatMonoDateShort(evidence.sourceDate, { withYear: false })} · confianza ${CONFIDENCE_LABELS_ES[provenance.confidence ?? evidence.confidence]}`,
              }))}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-grey-5">No existe evidencia cuantificada de valor todavía.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-[72px] gap-y-8 border-t border-grey-3 pt-8 sm:grid-cols-2">
        {adoptionSummary && (
          <div>
            <SectionHeader eyebrow="Adopción" action={{ label: 'Ver adopción y uso', href: `/customers/${customerId_}/adoption` }} />
            <p className="mt-3 text-2xl font-extrabold text-ink">{adoptionSummary.levelLabel}</p>
            <p className="mt-1 text-sm text-grey-6">
              {[adoptionSummary.activeUsersLabel, adoptionSummary.workflowCoverageLabel, adoptionSummary.independentOperationLabel]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
        {commercialSummary && (
          <div>
            <SectionHeader eyebrow="Comercial" action={{ label: 'Ver comercial', href: `/customers/${customerId_}/commercial` }} />
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
