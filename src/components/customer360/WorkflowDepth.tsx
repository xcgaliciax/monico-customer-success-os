import { WORKFLOW_DEPTH_STATUS_LABELS_ES } from '../../lib/labels';
import type { WorkflowDepthStep } from '../../types/adoption';

const STATUS_TEXT_CLASS: Record<WorkflowDepthStep['status'], string> = {
  confirmed: 'text-health-green',
  confirmed_frequent: 'text-health-green',
  reported_no_telemetry: 'text-grey-6',
};

// Spec §17: "Escalera 01-06 con estado de confirmación por paso." Not every account
// runs every step end-to-end — that's a fact about the workflow, not a coverage gap.
export function WorkflowDepth({ steps, note }: { steps: WorkflowDepthStep[]; note?: string }) {
  return (
    <div>
      <ol>
        {steps.map((step) => (
          <li key={step.order} className="flex items-center justify-between gap-4 border-b border-grey-2 py-2.5 last:border-0">
            <span className="flex items-center gap-3 text-sm text-ink">
              <span className="font-mono text-xs text-grey-5">{String(step.order).padStart(2, '0')}</span>
              {step.label}
            </span>
            <span className={`text-sm font-medium ${STATUS_TEXT_CLASS[step.status]}`}>
              {WORKFLOW_DEPTH_STATUS_LABELS_ES[step.status]}
            </span>
          </li>
        ))}
      </ol>
      {note && <p className="mt-3 text-xs text-grey-5">{note}</p>}
    </div>
  );
}
