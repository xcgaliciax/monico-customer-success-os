import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { STATUS_BADGE_COLOR, STATUS_LABELS_ES, TREND_LABELS_ES } from '../../lib/labels';
import type { Customer } from '../../types/customer';
import type { HealthSnapshot } from '../../types/healthSnapshot';

interface AttentionAccountRowProps {
  customer: Customer;
  snapshot: HealthSnapshot;
  focusStatement: string;
}

// Portfolio-level generalization of the Resumen "Atención" pattern — an account,
// not a risk, is the subject here. Yellow means attention, not failure: no red
// treatment is ever used for a Yellow account.
export function AttentionAccountRow({ customer, snapshot, focusStatement }: AttentionAccountRowProps) {
  const trendInfo = TREND_LABELS_ES[snapshot.trend];
  return (
    <Link to={`/customers/${customer.id}`} className="flex items-start justify-between gap-6 py-4 transition-colors hover:bg-grey-1">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-ink">{customer.name}</span>
          <Badge color={STATUS_BADGE_COLOR[snapshot.finalStatus]}>
            {snapshot.finalScore} {STATUS_LABELS_ES[snapshot.finalStatus]}
          </Badge>
          <span className="text-xs font-medium text-health-green">
            {trendInfo.arrow} {trendInfo.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-grey-6">{focusStatement}</p>
      </div>
    </Link>
  );
}
