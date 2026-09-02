import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { buildCustomerReportView } from '../../lib/customer360';
import { formatArrCompact, formatDate } from '../../lib/formatters';
import { CONFIDENCE_LABELS_ES, DIMENSION_LABELS_ES, LIFECYCLE_LABELS_ES, STATUS_BADGE_COLOR, STATUS_LABELS_ES, TREND_LABELS_ES } from '../../lib/labels';

// Standalone print/report route (spec Phase I) — same view-models and repository
// boundary as the interactive portal, no separate HealthScore calculation. No
// AppShell chrome: this is meant to be printed or saved as PDF via the browser.
export function ReportPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const report = customerId ? buildCustomerReportView(customerId) : undefined;

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16 text-center">
        <p className="text-sm text-grey-5">Reporte no disponible aún para esta cuenta en este prototipo.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-monico-blue hover:underline">
          Volver al Panel
        </Link>
      </div>
    );
  }

  const { overview, risks, commercial, evidenceCount } = report;
  const { header, whyScoreInsights, nextAction, dimensionContributions, valueDisplay } = overview;
  const { customer, snapshot } = header;
  const trendInfo = TREND_LABELS_ES[snapshot!.trend];

  return (
    <div className="mx-auto max-w-[860px] px-10 py-10 print:px-0 print:py-0">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link to={`/customers/${customer.id}/resumen`} className="text-sm text-monico-blue hover:underline">
          ← Volver a {customer.name}
        </Link>
        <Button variant="primary" onClick={() => window.print()}>
          Imprimir / Guardar como PDF
        </Button>
      </div>

      <header className="border-b border-grey-3 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">monico · Customer Success OS · Reporte ejecutivo</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{customer.name}</h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl font-extrabold text-monico-blue tabular-nums">{snapshot!.finalScore}</span>
          <span className="text-sm text-grey-5">/100</span>
          <Badge color={STATUS_BADGE_COLOR[snapshot!.finalStatus]}>{STATUS_LABELS_ES[snapshot!.finalStatus]}</Badge>
          <span className="text-sm font-medium text-health-green">
            {trendInfo.arrow} {trendInfo.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-grey-6">
          {LIFECYCLE_LABELS_ES[snapshot!.lifecycle]} · Confianza {CONFIDENCE_LABELS_ES[snapshot!.confidence]} · ARR {formatArrCompact(customer.arrUsd)}
        </p>
        <p className="mt-1 text-xs text-grey-5">Snapshot: {formatDate(snapshot!.snapshotDate)}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Composición del HealthScore</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-grey-3 text-left text-[10px] uppercase tracking-[0.06em] text-grey-5">
              <th className="py-1.5">Dimensión</th>
              <th className="py-1.5 text-right">Peso</th>
              <th className="py-1.5 text-right">Puntaje</th>
              <th className="py-1.5 text-right">Aporte</th>
            </tr>
          </thead>
          <tbody>
            {dimensionContributions.map((c) => (
              <tr key={c.dimension} className="border-b border-grey-2">
                <td className="py-1.5">{DIMENSION_LABELS_ES[c.dimension]}</td>
                <td className="py-1.5 text-right tabular-nums">{Math.round(c.weight * 100)}%</td>
                <td className="py-1.5 text-right font-semibold tabular-nums">{c.score}</td>
                <td className="py-1.5 text-right tabular-nums">{c.contribution.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {whyScoreInsights.length > 0 && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Por qué este puntaje</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {whyScoreInsights.map((insight) => (
              <li key={insight.id}>
                <span className="font-semibold text-ink">{insight.statement}</span>
                {insight.context && <span className="text-grey-6"> — {insight.context}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 break-inside-avoid">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Valor</h2>
        {valueDisplay.kind === 'quantified' ? (
          <div className="mt-3 grid grid-cols-3 gap-6">
            {valueDisplay.metrics.map((metric) => (
              <div key={metric.id}>
                <div className="text-2xl font-extrabold text-ink">{metric.value}</div>
                <div className="text-xs text-grey-6">{metric.label}</div>
              </div>
            ))}
          </div>
        ) : valueDisplay.evidence.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm">
            {valueDisplay.evidence.map(({ evidence }) => (
              <li key={evidence.id} className="text-ink">
                {evidence.statement} <span className="text-grey-5">— {evidence.source}, {formatDate(evidence.sourceDate)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-grey-5">No existe evidencia cuantificada de valor todavía.</p>
        )}
      </section>

      <section className="mt-8 break-inside-avoid">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Riesgos</h2>
        {risks.openRisks.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {risks.openRisks.map(({ risk, healthImpactStatement }) => (
              <li key={risk.id}>
                <span className="font-semibold text-ink">{risk.shortTitle ?? risk.title}</span>
                <span className="text-grey-6"> — {risk.shortCause ?? risk.description}</span>
                <div className="text-xs text-grey-5">{healthImpactStatement}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-grey-5">No hay riesgo material registrado.</p>
        )}
      </section>

      <section className="mt-8 break-inside-avoid">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Comercial</h2>
        <p className="mt-3 text-sm text-ink">
          ARR {formatArrCompact(customer.arrUsd)} · {customer.commercial.renewalConfirmed ? 'Renovación confirmada' : 'Renovación no confirmada'}
          {customer.commercial.paymentWindowLabel ? ` · pago ${customer.commercial.paymentWindowLabel}` : ''}
          {commercial.expansionReadinessLabel ? ` · expansión ${commercial.expansionReadinessLabel}` : ''}
        </p>
      </section>

      {nextAction && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Qué sigue</h2>
          <p className="mt-3 text-sm text-ink">{nextAction.headline}</p>
        </section>
      )}

      <footer className="mt-10 border-t border-grey-3 pt-4 text-xs text-grey-5">
        Registro de evidencia: {evidenceCount} entradas estructuradas respaldan este reporte. monico Customer Success OS — v0.1.
      </footer>
    </div>
  );
}
