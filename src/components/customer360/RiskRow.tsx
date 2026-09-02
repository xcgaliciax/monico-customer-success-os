import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface RiskRowProps {
  title: string;
  cause: string;
  dependencyTypeLabel?: string;
  severityLabel: string;
  healthImpactStatement?: string;
  href?: string;
}

// Spec §12, low-severity treatment only (the approved scope for Phase 3A): "Sólo la
// palabra 'Severidad baja' en orange dentro de la línea de metadatos. Sin fondo, sin
// borde, sin ícono." Medium/high badge treatments are not yet implemented.
export function RiskRow({ title, cause, dependencyTypeLabel, severityLabel, healthImpactStatement, href }: RiskRowProps) {
  const content = (
    <div>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-grey-5">{cause}</p>
      <p className="mt-2 text-xs text-grey-5">
        {[dependencyTypeLabel, <span key="severity" className="text-c-orange">{severityLabel}</span>, healthImpactStatement]
          .filter(Boolean)
          .reduce<ReactNode[]>((acc, node, index) => {
            if (index > 0) acc.push(<span key={`sep-${index}`} aria-hidden="true"> · </span>);
            acc.push(node);
            return acc;
          }, [])}
      </p>
    </div>
  );

  return href ? (
    <Link to={href} className="block rounded-md transition-colors hover:bg-grey-1">
      {content}
    </Link>
  ) : (
    content
  );
}
