import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { TREND_LABELS } from '../../lib/labels';
import type { Trend } from '../../types/health';

// Green/yellow/red are reserved for HealthStatus. Trend is conveyed by icon shape
// and label only, kept neutral in color.
const TREND_ICONS: Record<Trend, LucideIcon> = {
  improving: TrendingUp,
  stable: Minus,
  deteriorating: TrendingDown,
};

export function TrendIndicator({ trend }: { trend: Trend }) {
  const Icon = TREND_ICONS[trend];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft">
      <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
      {TREND_LABELS[trend]}
    </span>
  );
}
