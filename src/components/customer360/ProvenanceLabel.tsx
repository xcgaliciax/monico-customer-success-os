import { ConfidenceLabel } from './ConfidenceLabel';
import { PROVENANCE_CLASS_LABELS_ES } from '../../lib/labels';
import type { Provenance } from '../../types/provenance';

// Spec §07: declares WHERE a value came from, not how much we trust it — 9px mono,
// uppercase, dotted underline (there is detail behind it), no fill/border/icon/color.
export function ProvenanceLabel({ provenance }: { provenance: Provenance }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-grey-5 [text-decoration:underline_dotted] [text-underline-offset:2px] decoration-grey-4">
      {PROVENANCE_CLASS_LABELS_ES[provenance.class]}
      {provenance.confidence && (
        <>
          <span aria-hidden="true">·</span>
          <ConfidenceLabel confidence={provenance.confidence} />
        </>
      )}
    </span>
  );
}
