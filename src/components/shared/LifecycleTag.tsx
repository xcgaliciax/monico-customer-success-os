import { LIFECYCLE_LABELS } from '../../lib/labels';
import type { Lifecycle } from '../../types/health';

// Lifecycle is customer maturity, not commercial growth potential — never rendered
// alongside or in place of Expansion Readiness.
export function LifecycleTag({ lifecycle }: { lifecycle: Lifecycle }) {
  return (
    <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs font-medium text-ink-soft">
      {LIFECYCLE_LABELS[lifecycle]}
    </span>
  );
}
