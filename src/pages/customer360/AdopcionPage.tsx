import { useParams } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '../../components/customer360/DataTable';
import { EmptyState } from '../../components/customer360/EmptyState';
import { InsightList } from '../../components/customer360/InsightList';
import { MetricGroup } from '../../components/customer360/MetricGroup';
import { NextAction } from '../../components/customer360/NextAction';
import { ProvenanceLabel } from '../../components/customer360/ProvenanceLabel';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { WorkflowDepth } from '../../components/customer360/WorkflowDepth';
import { buildCustomerAdoptionView, deriveAdoptionLevelLabel } from '../../lib/customer360';
import { formatTokens, formatUsd2 } from '../../lib/formatters';
import { MODULE_LABELS_ES, MODULE_USAGE_STATE_LABELS_ES } from '../../lib/labels';
import type { ModuleUsage, ModuleUsageState } from '../../types/adoption';

const MODULE_STATE_TEXT_CLASS: Record<ModuleUsageState, string> = {
  recurring: 'text-health-green',
  selective: 'text-grey-6',
  in_use: 'text-grey-6',
  low: 'text-c-orange',
  no_evidence: 'text-grey-5',
  not_applicable: 'text-c-orange',
};

const PERIODS = ['7 d', '30 d', '60 d', '90 d'];

export function AdopcionPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const viewModel = customerId ? buildCustomerAdoptionView(customerId) : undefined;

  if (!viewModel) {
    return (
      <div className="rounded-xl border border-grey-3 bg-white px-6 py-16 text-center">
        <p className="text-sm text-grey-5">Adopción detallada no disponible aún para esta cuenta en este prototipo.</p>
      </div>
    );
  }

  const {
    header,
    blockerSummary,
    headlineMetrics,
    moduleUsage,
    workflowDepth,
    perUserTelemetryAvailable,
    usersTotal,
    usersActive,
    requiredRoleActivationScore,
    platformTelemetry,
    hasSufficientHistory,
    adoptionInsights,
    nextAction,
  } = viewModel;

  const evidenceHref = `/customers/${header.customer.id}/evidence`;
  const levelLabel = header.snapshot ? deriveAdoptionLevelLabel(header.snapshot.dimensions.workflowAdoption) : '—';

  const recurringOrSelective = moduleUsage.filter((m) => m.state === 'recurring' || m.state === 'selective' || m.state === 'in_use').length;
  const noEvidence = moduleUsage.filter((m) => m.state === 'no_evidence').length;

  const moduleColumns: DataTableColumn<ModuleUsage>[] = [
    { key: 'module', header: 'Módulo', widthClassName: 'w-48', render: (row) => MODULE_LABELS_ES[row.module] },
    {
      key: 'state',
      header: 'Estado de uso',
      widthClassName: 'w-40',
      render: (row) => <span className={`font-semibold ${MODULE_STATE_TEXT_CLASS[row.state]}`}>{MODULE_USAGE_STATE_LABELS_ES[row.state]}</span>,
    },
    { key: 'evidence', header: 'Evidencia', render: (row) => <span className="text-grey-6">{row.evidenceStatement}</span> },
    {
      key: 'provenance',
      header: 'Procedencia',
      align: 'right',
      widthClassName: 'w-48',
      render: (row) => <ProvenanceLabel provenance={row.provenance} />,
    },
  ];

  return (
    <div className="space-y-11">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Adopción</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-[64px] font-extrabold leading-none tracking-[-0.04em] text-ink">{levelLabel}</span>
          <span className="text-sm text-grey-5">{blockerSummary}</span>
        </div>
      </div>

      <MetricGroup items={headlineMetrics.map((metric) => ({ value: metric.value, label: metric.label, provenance: metric.provenance }))} />

      <div>
        <SectionHeader eyebrow="Adopción por módulo" note={`${recurringOrSelective} con uso · ${noEvidence} sin evidencia`} />
        <div className="mt-4">
          <DataTable columns={moduleColumns} rows={moduleUsage} getRowKey={(row) => row.module} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-[72px] gap-y-8 lg:grid-cols-[1fr_420px]">
        <div>
          <SectionHeader eyebrow="Profundidad del flujo" note={workflowDepth ? 'Adopción significativa, no inicios de sesión' : undefined} />
          <div className="mt-4">
            {workflowDepth ? (
              <WorkflowDepth
                steps={workflowDepth}
                note="No todo proceso recorre todos los módulos y eso no es una brecha: lo que se mide es que el trabajo relevante ocurra de punta a punta."
              />
            ) : (
              <p className="text-sm text-grey-5">Detalle de profundidad de flujo no disponible aún para esta cuenta.</p>
            )}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="Usuarios y roles" note={`${usersActive ?? '—'} de ${usersTotal} con actividad`} />
          <div className="mt-4 space-y-5">
            {!perUserTelemetryAvailable && (
              <EmptyState
                variant="no_instrumented"
                detail={usersActive !== undefined ? `${usersTotal} asientos, ${usersActive} con actividad` : `${usersTotal} asientos, conteo activo no disponible`}
              />
            )}
            {requiredRoleActivationScore !== undefined && (
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-grey-6">Activación de Roles Requeridos</span>
                  <span className="text-lg font-bold tabular-nums text-ink">{requiredRoleActivationScore} / 100</span>
                </div>
                <p className="mt-2 text-[13px] text-grey-5">
                  La activación de roles pesa más que la utilización total de asientos.
                  {usersActive !== undefined ? ` ${usersActive} de ${usersTotal} no es una brecha por sí sola.` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {platformTelemetry && (
        <div className="border-t border-grey-3 pt-8">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader eyebrow="Telemetría de plataforma" />
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-grey-5">
              MEDIDO{platformTelemetry.sourceRef ? ` · COMMAND CENTER · ${platformTelemetry.sourceRef}` : ''}
            </span>
          </div>
          <p className="mt-2 text-[15px] text-grey-6">
            Salud de Procesamiento <span className="font-bold text-ink">{platformTelemetry.platformProcessingHealthScore} / 100</span> — mide la
            plataforma, no al cliente. No es el HealthScore y no lo modifica.
          </p>
          <div className="mt-4">
            <MetricGroup
              items={[
                { value: `${platformTelemetry.processingSuccessRatePct}%`, label: 'éxito de procesamiento', size: 'sm' },
                { value: String(platformTelemetry.activeProjects), label: 'proyectos activos', size: 'sm' },
                { value: String(platformTelemetry.completedProjects), label: 'completados', size: 'sm' },
                {
                  value: platformTelemetry.avgProcessingTimeLabel,
                  label: 'tiempo de proceso',
                  comparison: `p95 ${platformTelemetry.p95ProcessingTimeLabel}`,
                  size: 'sm',
                },
                { value: `${platformTelemetry.archivedErrors} · ${platformTelemetry.trashedCount}`, label: 'errores · papelera', size: 'sm' },
              ]}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-grey-5">
            <span>
              Consumo trazado {formatTokens(platformTelemetry.tokensConsumed)} tokens · costo total {formatUsd2(platformTelemetry.costUsdTotal)}
              {platformTelemetry.costUsdFromFailures !== undefined ? `, de los cuales ${formatUsd2(platformTelemetry.costUsdFromFailures)} asociados a fallos` : ''}
            </span>
            <a href={evidenceHref} className="flex-none font-medium text-monico-blue hover:underline">
              Ver Command Center →
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-[72px] gap-y-8 border-t border-grey-3 pt-8 lg:grid-cols-2">
        <div>
          <div className="flex items-start justify-between gap-4">
            <SectionHeader eyebrow="Tendencia" />
            <div className="flex gap-3 text-xs text-grey-5">
              {PERIODS.map((period) => (
                <span key={period} className="cursor-default">
                  {period}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">{!hasSufficientHistory && <EmptyState variant="insufficient_history" />}</div>
        </div>
        <div>
          <SectionHeader eyebrow="Insights de adopción" />
          <div className="mt-2">
            {adoptionInsights.length > 0 ? (
              <InsightList items={adoptionInsights.map((insight) => ({ id: insight.id, statement: insight.statement, context: insight.context, href: evidenceHref }))} />
            ) : (
              <p className="py-4 text-sm text-grey-5">Aún no hay insights curados para esta cuenta.</p>
            )}
          </div>
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
