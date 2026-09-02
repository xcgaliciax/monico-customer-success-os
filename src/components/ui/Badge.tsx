import type { ReactNode } from 'react';

export type BadgeColor = 'green' | 'orange' | 'red';

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: 'bg-health-green-soft text-health-green',
  orange: 'bg-health-yellow-soft text-health-yellow',
  red: 'bg-health-red-soft text-health-red',
};

// Minimal stand-in for the monico Design System Badge (spec §17). Status is never
// conveyed by color alone — callers pass text content, this never renders a bare dot.
export function Badge({ color, children }: { color: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${COLOR_CLASSES[color]}`}
    >
      {children}
    </span>
  );
}
