import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow: string;
  action?: { label: string; href: string };
  note?: ReactNode;
}

// Spec: "Único encabezado de sección del producto. No hay h2 grande en pantalla."
// 11px/700 uppercase, +0.14em tracking, grey-5 — with an optional depth link or a
// plain right-aligned note (mutually exclusive).
export function SectionHeader({ eyebrow, action, note }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">{eyebrow}</h2>
      {action && (
        <Link to={action.href} className="text-sm font-medium text-monico-blue hover:underline">
          {action.label} →
        </Link>
      )}
      {!action && note && <div className="text-xs text-grey-5">{note}</div>}
    </div>
  );
}
