import { Link } from 'react-router-dom';
import { DIMENSION_LABELS_ES } from '../../lib/labels';
import type { DimensionContribution } from '../../types/health';

interface HealthDimensionTableProps {
  contributions: DimensionContribution[];
  footerNote: string;
  evidenceHref: string;
}

// Spec §05: read as an aligned table, never a chart — no progress bars, no gauges.
// Clicking a row goes to evidence. Weight in mono 12px grey-5, score in 17/700 ink,
// right-aligned tabular-nums.
export function HealthDimensionTable({ contributions, footerNote, evidenceHref }: HealthDimensionTableProps) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-grey-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-grey-5">
        <span>Dimensión</span>
        <span className="text-right">Peso</span>
        <span className="text-right">Puntaje</span>
      </div>
      {contributions.map((contribution, index) => (
        <Link
          key={contribution.dimension}
          to={evidenceHref}
          className={[
            'grid grid-cols-[1fr_auto_auto] items-center gap-x-6 py-3 text-[15px] text-ink transition-colors hover:bg-grey-1',
            index < contributions.length - 1 ? 'border-b border-grey-2' : '',
          ].join(' ')}
        >
          <span>{DIMENSION_LABELS_ES[contribution.dimension]}</span>
          <span className="text-right font-mono text-xs text-grey-5 tabular-nums">{Math.round(contribution.weight * 100)}%</span>
          <span className="text-right text-[17px] font-bold tabular-nums text-ink">{contribution.score}</span>
        </Link>
      ))}
      <p className="mt-3 text-xs text-grey-5">{footerNote}</p>
    </div>
  );
}
