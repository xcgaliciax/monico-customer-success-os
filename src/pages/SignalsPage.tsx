import { Link } from 'react-router-dom';
import { ProvenanceLabel } from '../components/customer360/ProvenanceLabel';
import { getPortfolioSignals } from '../services/customerRepository';

export function SignalsPage() {
  const signals = getPortfolioSignals();

  return (
    <div className="space-y-6 pb-16 pt-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">Señales</h1>
        <p className="mt-2 max-w-2xl text-sm text-grey-6">
          Primera vista de Customer Intelligence entre cuentas: patrones de producto y adopción observados en el portafolio actual.
        </p>
      </header>

      <div className="divide-y divide-grey-2 border-t border-grey-3">
        {signals.map((signal) => {
          const content = (
            <div className="flex items-start justify-between gap-6 py-5">
              <div>
                <p className="text-base font-semibold text-ink">{signal.title}</p>
                <p className="mt-1 max-w-2xl text-sm text-grey-6">{signal.statement}</p>
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
    </div>
  );
}
