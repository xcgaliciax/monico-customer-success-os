import { Link } from 'react-router-dom';
import { ProvenanceLabel } from '../components/customer360/ProvenanceLabel';
import { Badge, type BadgeColor } from '../components/ui/Badge';
import {
  getPortfolioIntelligence,
  type AttentionItem,
  type OpportunityItem,
  type OpportunityKind,
} from '../lib/customerIntelligence';
import type { RiskSeverity } from '../types/risk';

const SEVERITY_LABELS: Record<RiskSeverity, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const SEVERITY_BADGE_COLOR: Record<RiskSeverity, BadgeColor> = {
  high: 'red',
  medium: 'orange',
  low: 'green',
};

const OPPORTUNITY_KIND_LABELS: Record<OpportunityKind, string> = {
  opportunity: 'Oportunidad',
  adoption: 'Adopción',
  value: 'Valor',
  health: 'Health',
};

function AttentionRow({ item, customerName }: { item: AttentionItem; customerName: string }) {
  return (
    <Link
      to={`/customers/${item.customerId}`}
      className="block border-b border-grey-2 py-5 transition-colors hover:bg-grey-1"
    >
      <div className="grid gap-4 md:grid-cols-[150px_minmax(0,1fr)_140px]">
        <div>
          <p className="text-sm font-semibold text-ink">{customerName}</p>
          <div className="mt-2">
            <Badge color={SEVERITY_BADGE_COLOR[item.severity]}>{SEVERITY_LABELS[item.severity]}</Badge>
          </div>
        </div>

        <div>
          <p className="text-base font-semibold text-ink">{item.title}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-grey-6">{item.cause}</p>

          {item.implication && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-grey-5">Implicación</p>
              <p className="mt-1 text-sm text-grey-6">{item.implication}</p>
            </div>
          )}
        </div>

        <div className="text-left md:text-right">
          {item.relatedEvidence.length > 0 && (
            <p className="text-xs text-grey-5">
              {item.relatedEvidence.length} {item.relatedEvidence.length === 1 ? 'evidencia' : 'evidencias'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function OpportunityRow({ item, customerName }: { item: OpportunityItem; customerName: string }) {
  return (
    <Link
      to={`/customers/${item.customerId}`}
      className="block border-b border-grey-2 py-5 transition-colors hover:bg-grey-1"
    >
      <div className="grid gap-4 md:grid-cols-[150px_minmax(0,1fr)_140px]">
        <div>
          <p className="text-sm font-semibold text-ink">{customerName}</p>
          <p className="mt-2 text-xs font-medium text-grey-5">{OPPORTUNITY_KIND_LABELS[item.kind]}</p>
        </div>

        <div>
          <p className="text-base font-semibold text-ink">{item.title}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-grey-6">{item.statement}</p>
        </div>

        <div className="text-left md:text-right">
          {item.confidence && <p className="text-xs text-grey-5">Confianza: {item.confidence}</p>}
          {item.relatedEvidence.length > 0 && (
            <p className="mt-2 text-xs text-grey-5">
              {item.relatedEvidence.length} {item.relatedEvidence.length === 1 ? 'evidencia' : 'evidencias'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SignalsPage() {
  const intelligence = getPortfolioIntelligence();

  const accountNameById = Object.fromEntries(
    intelligence.accounts.map((account) => [account.customerId, account.customerName]),
  );

  return (
    <div className="space-y-10 pb-16 pt-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</p>

        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">Customer Intelligence</h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-6">
          Qué requiere intervención, qué va bien o podría convertirse en oportunidad, y qué patrón se observa a
          través de las cuentas del portafolio.
        </p>
      </header>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Intervención</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Qué requiere atención</h2>
          </div>
          <p className="text-xs text-grey-5">
            {intelligence.attentionItems.length} {intelligence.attentionItems.length === 1 ? 'riesgo abierto' : 'riesgos abiertos'}
          </p>
        </div>

        <div className="mt-4 border-t border-grey-3">
          {intelligence.attentionItems.length > 0 ? (
            intelligence.attentionItems.map((item) => (
              <AttentionRow key={item.id} item={item} customerName={accountNameById[item.customerId] ?? item.customerId} />
            ))
          ) : (
            <p className="py-5 text-sm text-grey-5">Sin riesgos abiertos registrados en el portafolio.</p>
          )}
        </div>
      </section>

      <section>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Positivo</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Oportunidades y señales por cuenta</h2>
          <p className="mt-2 max-w-2xl text-sm text-grey-6">
            Conclusiones curadas y positivas — expansión, valor verificado, momentum de adopción — que no son
            riesgos ni requieren intervención.
          </p>
        </div>

        <div className="mt-4 border-t border-grey-3">
          {intelligence.opportunityItems.length > 0 ? (
            intelligence.opportunityItems.map((item) => (
              <OpportunityRow key={item.id} item={item} customerName={accountNameById[item.customerId] ?? item.customerId} />
            ))
          ) : (
            <p className="py-5 text-sm text-grey-5">Sin oportunidades curadas todavía.</p>
          )}
        </div>
      </section>

      <section>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Patrones del portafolio</p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Señales observadas</h2>

          <p className="mt-2 max-w-2xl text-sm text-grey-6">
            Lecturas transversales de producto, adopción y expansión. Estas señales no modifican automáticamente el
            HealthScore.
          </p>
        </div>

        <div className="mt-4 divide-y divide-grey-2 border-t border-grey-3">
          {intelligence.signals.map((signal) => {
            const content = (
              <div className="flex items-start justify-between gap-6 py-5">
                <div>
                  <p className="text-base font-semibold text-ink">{signal.title}</p>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-grey-6">{signal.statement}</p>
                </div>

                <ProvenanceLabel provenance={signal.provenance} />
              </div>
            );

            return signal.relatedCustomerId ? (
              <Link key={signal.id} to={`/customers/${signal.relatedCustomerId}`} className="block hover:bg-grey-1">
                {content}
              </Link>
            ) : (
              <div key={signal.id}>{content}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
