import { ProvenanceLabel } from './ProvenanceLabel';
import type { Provenance } from '../../types/provenance';

export interface MetricItemProps {
  value: string;
  label: string;
  provenance?: Provenance;
  comparison?: string;
  /** md (28px) for general metric strips; sm (24px) for platform telemetry (spec §06/§03). */
  size?: 'md' | 'sm';
}

// Spec §06 "Patrón de métrica": valor (28/800 tabular) · etiqueta (14 grey-6) ·
// procedencia+confianza · comparación opcional, in that fixed order.
export function MetricItem({ value, label, provenance, comparison, size = 'md' }: MetricItemProps) {
  return (
    <div className="px-8 py-[22px] first:pl-0 last:pr-0">
      <div className={`${size === 'sm' ? 'text-2xl' : 'text-[28px]'} font-extrabold leading-none tabular-nums text-ink`}>{value}</div>
      <div className="mt-2 text-sm text-grey-6">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        {provenance && <ProvenanceLabel provenance={provenance} />}
        {comparison && <span className="text-xs text-grey-5">{comparison}</span>}
      </div>
    </div>
  );
}
