import { CONFIDENCE_TAG_LABELS_ES } from '../../lib/labels';
import type { Confidence } from '../../types/health';

// Spec §07: 9px mono, uppercase, +0.06em tracking, grey-5. Never a second badge.
export function ConfidenceLabel({ confidence }: { confidence: Confidence }) {
  return <span className="font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-grey-5">{CONFIDENCE_TAG_LABELS_ES[confidence]}</span>;
}
