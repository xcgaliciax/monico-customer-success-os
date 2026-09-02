import { Badge } from '../ui/Badge';
import { CONFIDENCE_LABELS_ES, LIFECYCLE_LABELS_ES, STATUS_BADGE_COLOR, STATUS_LABELS_ES, TREND_LABELS_ES } from '../../lib/labels';
import type { Confidence, HealthStatus, Lifecycle, Trend } from '../../types/health';

interface HealthSummaryProps {
  variant: 'full' | 'compact';
  score: number;
  status: HealthStatus;
  trend: Trend;
  lifecycle: Lifecycle;
  confidence: Confidence;
}

// Spec §05 "Patrón de Salud": número + estado + tendencia, nunca gauge/dial/donut/
// barra. Full variant = header Nivel 2+3 (Resumen only); compact = one line, no
// trend/confidence (spec §04 — those belong only to the full header).
export function HealthSummary({ variant, score, status, trend, lifecycle, confidence }: HealthSummaryProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-[13px] text-grey-6">
        <span className="text-grey-5">HealthScore</span>
        <span className="text-[22px] font-extrabold text-monico-blue tabular-nums">{score}</span>
        <Badge color={STATUS_BADGE_COLOR[status]}>{STATUS_LABELS_ES[status]}</Badge>
        <span>{LIFECYCLE_LABELS_ES[lifecycle]}</span>
      </div>
    );
  }

  const trendInfo = TREND_LABELS_ES[trend];

  return (
    <div>
      <div className="flex items-end gap-3">
        <div className="flex items-baseline font-extrabold tracking-[-0.045em] text-monico-blue">
          <span className="text-[92px] leading-none tabular-nums">{score}</span>
          <span className="text-[22px] font-semibold text-grey-5">/100</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Badge color={STATUS_BADGE_COLOR[status]}>{STATUS_LABELS_ES[status]}</Badge>
          <span className="inline-flex items-center gap-1 text-[17px] font-bold text-health-green">
            {trendInfo.arrow} {trendInfo.label}
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm text-grey-6">
        {LIFECYCLE_LABELS_ES[lifecycle]} · Confianza {CONFIDENCE_LABELS_ES[confidence]}
      </p>
    </div>
  );
}
