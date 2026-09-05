import { CheckInPill } from './CheckInPill';
import { NEXT_STEP_OPTIONS } from '../../lib/customerUpdate/checkInConfig';
import type { NextStepCheckIn, NextStepOption } from '../../types/customerCheckIn';

const inputClass = 'w-full rounded-md border border-grey-3 bg-white px-3 py-2 text-sm text-ink focus:border-monico-blue focus:outline-none';
const labelClass = 'block text-xs font-semibold text-grey-6';

interface NextStepCheckInSectionProps {
  value: NextStepCheckIn;
  onChange: (next: NextStepCheckIn) => void;
}

// Choosing an option here always proposes a NextAction (it's a CS-internal
// directive, not a claim about the customer) — the one exception is "Otro",
// which needs the detail text since the option alone says nothing on its own.
export function NextStepCheckInSection({ value, onChange }: NextStepCheckInSectionProps) {
  const setOption = (option: NextStepOption) => onChange({ ...value, option });

  return (
    <div className="space-y-3 rounded-lg border border-grey-3 bg-white p-4">
      <h3 className="text-sm font-bold text-ink">¿Qué debería pasar ahora?</h3>

      <div className="flex flex-wrap gap-2">
        {NEXT_STEP_OPTIONS.map((option) => (
          <CheckInPill key={option.value} label={option.label} color={option.color} active={value.option === option.value} onClick={() => setOption(option.value)} />
        ))}
      </div>

      {value.option && (
        <label className="block space-y-1">
          <span className={labelClass}>{value.option === 'other' ? 'Describe la acción' : 'Detalle (opcional)'}</span>
          <textarea
            className={inputClass}
            rows={2}
            value={value.detail ?? ''}
            onChange={(e) => onChange({ ...value, detail: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}
