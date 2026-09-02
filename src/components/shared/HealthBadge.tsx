import { AlertOctagon, AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react';
import { STATUS_LABELS } from '../../lib/labels';
import type { HealthStatus } from '../../types/health';

// Health is never conveyed by color alone: score + text label + a distinct icon
// shape per status all carry the signal independently.
const STATUS_STYLES: Record<HealthStatus, { icon: LucideIcon; text: string; bg: string }> = {
  green: { icon: CheckCircle2, text: 'text-health-green', bg: 'bg-health-green-soft' },
  yellow: { icon: AlertTriangle, text: 'text-health-yellow', bg: 'bg-health-yellow-soft' },
  red: { icon: AlertOctagon, text: 'text-health-red', bg: 'bg-health-red-soft' },
};

interface HealthBadgeProps {
  score: number;
  status: HealthStatus;
}

export function HealthBadge({ score, status }: HealthBadgeProps) {
  const { icon: Icon, text, bg } = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${bg} ${text}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{score}</span>
      <span className="text-xs font-semibold uppercase tracking-wide">{STATUS_LABELS[status]}</span>
    </span>
  );
}
