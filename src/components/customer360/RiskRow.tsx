import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import type { RiskSeverity } from '../../types/risk';

interface RiskRowProps {
  title: string;
  cause: string;
  dependencyTypeLabel?: string;
  severity: RiskSeverity;
  healthImpactStatement?: string;
  owner?: string;
  ageLabel?: string;
  href?: string;
}

const SEVERITY_LABEL_ES: Record<RiskSeverity, string> = {
  low: 'Severidad baja',
  medium: 'Severidad media',
  high: 'Severidad alta',
};

// Spec §12. Baja: the word only, orange text, in the metadata line — no fill, no
// border, no icon. Media: an orange Badge next to the title, above baja risks in
// any list. Alta: a red Badge, first position in any list, with the Health impact
// always stated explicitly (never omitted).
export function RiskRow({ title, cause, dependencyTypeLabel, severity, healthImpactStatement, owner, ageLabel, href }: RiskRowProps) {
  const metadataParts: ReactNode[] = [dependencyTypeLabel];
  if (severity === 'low') {
    metadataParts.push(<span key="severity" className="text-c-orange">{SEVERITY_LABEL_ES.low}</span>);
  }
  metadataParts.push(healthImpactStatement, owner ? `Responsable ${owner}` : undefined, ageLabel);

  const content = (
    <div>
      <div className="flex items-center gap-2">
        {severity === 'high' && <Badge color="red">{SEVERITY_LABEL_ES.high}</Badge>}
        {severity === 'medium' && <Badge color="orange">{SEVERITY_LABEL_ES.medium}</Badge>}
        <p className="text-base font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-1 text-sm text-grey-5">{cause}</p>
      <p className="mt-2 text-xs text-grey-5">
        {metadataParts
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
