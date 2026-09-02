import { HealthSummary } from './HealthSummary';
import { PageAction, type PageActionSpec } from './PageAction';
import { formatArrCompact } from '../../lib/formatters';
import type { Customer } from '../../types/customer';
import type { Confidence, HealthStatus, Lifecycle, Trend } from '../../types/health';

interface CustomerHeaderProps {
  variant: 'full' | 'compact';
  customer: Customer;
  score: number;
  status: HealthStatus;
  trend: Trend;
  lifecycle: Lifecycle;
  confidence: Confidence;
  actions: PageActionSpec[];
}

// Spec §04 "Header de cuenta": nine fields, zero cards. Hierarchy replaces
// containers — no field owns its own border, background or pill except the Salud
// badge inside HealthSummary.
export function CustomerHeader({ variant, customer, score, status, trend, lifecycle, confidence, actions }: CustomerHeaderProps) {
  const actionSize = variant === 'full' ? 'md' : 'sm';

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-4 py-[26px]">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-ink">{customer.name}</span>
          <span aria-hidden="true" className="h-5 w-px bg-grey-3" />
          <HealthSummary variant="compact" score={score} status={status} trend={trend} lifecycle={lifecycle} confidence={confidence} />
        </div>
        <div className="flex flex-none items-center gap-2">
          {actions.map((action) => (
            <PageAction key={action.id} action={action} size={actionSize} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-8 pt-11 pb-6">
      <div className="flex items-start gap-6">
        <div className="pr-6">
          <h1 className="text-[34px] font-extrabold leading-tight text-ink">{customer.name}</h1>
          {customer.headerSubtitle && <p className="mt-1 text-sm text-grey-5">{customer.headerSubtitle}</p>}
        </div>
        <span aria-hidden="true" className="mt-1 h-16 w-px flex-none bg-grey-3" />
        <div>
          <HealthSummary variant="full" score={score} status={status} trend={trend} lifecycle={lifecycle} confidence={confidence} />
          <p className="mt-3 text-[13px] text-grey-5">
            ARR <span className="font-medium text-grey-6">{formatArrCompact(customer.arrUsd)}</span>
            {customer.champions.length > 0 && (
              <>
                {' '}
                · Champions <span className="font-medium text-grey-6">{customer.champions.join(' + ')}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-2 pt-1">
        {actions.map((action) => (
          <PageAction key={action.id} action={action} size={actionSize} />
        ))}
      </div>
    </div>
  );
}
