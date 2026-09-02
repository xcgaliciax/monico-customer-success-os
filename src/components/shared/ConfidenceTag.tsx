import { CONFIDENCE_LABELS } from '../../lib/labels';
import type { Confidence } from '../../types/health';

// Deliberately plain: confidence is informational context, not an alert.
export function ConfidenceTag({ confidence }: { confidence: Confidence }) {
  return <span className="text-sm text-muted">{CONFIDENCE_LABELS[confidence]}</span>;
}
