import type { PillColor } from '../../lib/customerUpdate/checkInConfig';

const ACTIVE_CLASSES: Record<PillColor, string> = {
  green: 'border-health-green bg-health-green-soft text-health-green',
  yellow: 'border-health-yellow bg-health-yellow-soft text-health-yellow',
  red: 'border-health-red bg-health-red-soft text-health-red',
  neutral: 'border-monico-blue bg-monico-blue/10 text-monico-blue',
};

const INACTIVE_CLASSES = 'border-grey-3 bg-white text-grey-6 hover:bg-grey-1';

// A selectable pill button — the primary input control for Step 2's check-in
// (product decision: "Use buttons, segmented controls, radios, or simple
// selectable pills," never raw domain terminology or a bare <select>).
export function CheckInPill({ label, color, active, onClick }: { label: string; color: PillColor; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? ACTIVE_CLASSES[color] : INACTIVE_CLASSES}`}
    >
      {label}
    </button>
  );
}
