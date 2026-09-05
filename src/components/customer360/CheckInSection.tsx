import { CheckInPill } from './CheckInPill';
import type { PillOption } from '../../lib/customerUpdate/checkInConfig';

const inputClass = 'w-full rounded-md border border-grey-3 bg-white px-3 py-2 text-sm text-ink focus:border-monico-blue focus:outline-none';
const labelClass = 'block text-xs font-semibold text-grey-6';

interface CheckInSectionProps<L extends string> {
  title: string;
  helper?: string;
  levelOptions: PillOption<L>[];
  level: L | undefined;
  onLevelChange: (value: L) => void;
  trendOptions: PillOption<'down' | 'same' | 'up'>[];
  trend: 'down' | 'same' | 'up' | undefined;
  onTrendChange: (value: 'down' | 'same' | 'up') => void;
  note: string;
  onNoteChange: (value: string) => void;
  notePlaceholder: string;
}

// One check-in section: "estado actual" pills, "tendencia" pills, and an
// optional free-text note. Reused for Valor percibido / Adopción / Champion ·
// Engagement / Expansión — Riesgo has its own variant (RiskCheckInSection)
// because of its extra blocker Y/N question.
export function CheckInSection<L extends string>({
  title,
  helper,
  levelOptions,
  level,
  onLevelChange,
  trendOptions,
  trend,
  onTrendChange,
  note,
  onNoteChange,
  notePlaceholder,
}: CheckInSectionProps<L>) {
  return (
    <div className="space-y-3 rounded-lg border border-grey-3 bg-white p-4">
      <div>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {helper && <p className="mt-0.5 text-xs text-grey-5">{helper}</p>}
      </div>

      <div>
        <span className={labelClass}>Estado actual</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {levelOptions.map((option) => (
            <CheckInPill key={option.value} label={option.label} color={option.color} active={level === option.value} onClick={() => onLevelChange(option.value)} />
          ))}
        </div>
      </div>

      <div>
        <span className={labelClass}>Tendencia</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {trendOptions.map((option) => (
            <CheckInPill key={option.value} label={option.label} color={option.color} active={trend === option.value} onClick={() => onTrendChange(option.value)} />
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className={labelClass}>Nota (opcional)</span>
        <textarea className={inputClass} rows={2} value={note} onChange={(e) => onNoteChange(e.target.value)} placeholder={notePlaceholder} />
      </label>
    </div>
  );
}
