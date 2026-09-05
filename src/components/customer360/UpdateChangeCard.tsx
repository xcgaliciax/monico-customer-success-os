import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { ProposedCustomerChange } from '../../types/proposedCustomerChange';

export const ENTITY_TYPE_LABELS: Record<ProposedCustomerChange['entityType'], string> = {
  evidence: 'Evidencia',
  insight: 'Insight',
  risk: 'Riesgo',
  next_action: 'Próxima acción',
};

export const OPERATION_LABELS: Record<ProposedCustomerChange['operation'], string> = {
  create: 'Crear',
  update: 'Actualizar',
  confirm: 'Confirmar',
  resolve: 'Resolver',
  no_change: 'Sin cambio',
};

// CSM-facing phrasing for Step 3 — a reviewer sees "Riesgo existente sigue
// vigente", never "entityType: risk, operation: confirm". Falls back to the raw
// technical labels for any entityType/operation pair not written here, so this
// stays safe even if new combinations are added later.
const FRIENDLY_PHRASES: Partial<Record<ProposedCustomerChange['entityType'], Partial<Record<ProposedCustomerChange['operation'], string>>>> = {
  evidence: { create: 'Nueva evidencia' },
  insight: {
    create: 'Nuevo insight propuesto',
    update: 'Actualizar insight existente',
    confirm: 'Insight existente sigue vigente',
    no_change: 'Insight revisado, sin cambios',
  },
  // "Blocker" is the Quick Check-in's user-facing word for a Risk — the model
  // already treats risks/blockers/dependencies as one entity (see types/risk.ts).
  risk: {
    create: 'Nuevo blocker',
    update: 'Actualizar blocker',
    confirm: 'Blocker existente sigue vigente',
    resolve: 'Marcar blocker como resuelto',
    no_change: 'Blocker revisado, sin cambios',
  },
  next_action: {
    create: 'Nueva próxima acción',
    update: 'Actualizar próxima acción',
    confirm: 'Próxima acción sigue vigente',
    no_change: 'Próxima acción revisada, sin cambios',
  },
};

export function describeChangeForReview(change: ProposedCustomerChange): string {
  return FRIENDLY_PHRASES[change.entityType]?.[change.operation] ?? `${ENTITY_TYPE_LABELS[change.entityType]} · ${OPERATION_LABELS[change.operation]}`;
}

const REVIEW_STATUS_BADGE: Record<ProposedCustomerChange['reviewStatus'], { label: string; color: 'green' | 'orange' | 'red' }> = {
  pending: { label: 'Pendiente', color: 'orange' },
  accepted: { label: 'Aceptado', color: 'green' },
  edited: { label: 'Editado', color: 'green' },
  rejected: { label: 'Rechazado', color: 'red' },
};

function summarizeValue(value: Record<string, unknown>): string[] {
  return Object.entries(value)
    .filter(([, fieldValue]) => fieldValue !== undefined && fieldValue !== '')
    .map(([key, fieldValue]) => `${key}: ${String(fieldValue)}`);
}

// The main, human-readable content of a proposed value — no field names, just
// the words a CSM actually wrote (or picked).
function friendlyLines(entityType: ProposedCustomerChange['entityType'], value: Record<string, unknown>): string[] {
  const lines: string[] = [];
  if (entityType === 'evidence' || entityType === 'insight') {
    if (value.statement) lines.push(String(value.statement));
    if (value.context) lines.push(String(value.context));
    return lines;
  }
  if (entityType === 'risk') {
    if (value.title) lines.push(String(value.title));
    if (value.description && value.description !== value.title) lines.push(String(value.description));
    if (value.shortCause && value.shortCause !== value.description) lines.push(String(value.shortCause));
    return lines;
  }
  // next_action
  if (value.headline) lines.push(String(value.headline));
  if (value.meta) lines.push(String(value.meta));
  return lines;
}

interface UpdateChangeCardProps {
  change: ProposedCustomerChange;
  targetLabel?: string;
  sourceEvidenceLabels: string[];
  editing?: ReactNode;
  onAccept?: () => void;
  onStartEdit?: () => void;
  onReject?: () => void;
}

// One review card per ProposedCustomerChange — Step 3. Leads with CSM-friendly
// phrasing and content; entityType/operation/raw field names are available
// underneath via "Ver detalle técnico" for anyone who wants them, not the
// primary reading. accept/edit/reject act only while reviewStatus is 'pending'
// so a decision, once made, isn't casually re-clicked away.
export function UpdateChangeCard({ change, targetLabel, sourceEvidenceLabels, editing, onAccept, onStartEdit, onReject }: UpdateChangeCardProps) {
  const statusBadge = REVIEW_STATUS_BADGE[change.reviewStatus];
  const displayedValue = change.reviewStatus === 'edited' && change.reviewedValue ? change.reviewedValue : change.proposedValue;
  const mainLines = friendlyLines(change.entityType, displayedValue);

  return (
    <div className="rounded-lg border border-grey-3 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-ink">{describeChangeForReview(change)}</span>
          {targetLabel && <span className="ml-2 text-xs text-grey-5">· {targetLabel}</span>}
        </div>
        <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
      </div>

      {editing ? (
        <div className="mt-3">{editing}</div>
      ) : (
        <>
          {mainLines.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-grey-6">
              {mainLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}

          {change.reviewStatus === 'edited' && (
            <details className="mt-2 text-xs text-grey-5">
              <summary className="cursor-pointer">Ver propuesta original</summary>
              <ul className="mt-1 space-y-1">
                {friendlyLines(change.entityType, change.proposedValue).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          )}

          <details className="mt-2 text-xs text-grey-5">
            <summary className="cursor-pointer">Ver detalle técnico</summary>
            <p className="mt-1">
              {ENTITY_TYPE_LABELS[change.entityType]} · {OPERATION_LABELS[change.operation]}
            </p>
            <ul className="mt-1 space-y-1">
              {summarizeValue(displayedValue).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </>
      )}

      {change.rationale && (
        <p className="mt-3 text-xs text-grey-5">
          <span className="font-semibold text-grey-6">Justificación:</span> {change.rationale}
        </p>
      )}

      {sourceEvidenceLabels.length > 0 && (
        <p className="mt-1 text-xs text-grey-5">
          <span className="font-semibold text-grey-6">Evidencia relacionada:</span> {sourceEvidenceLabels.join(', ')}
        </p>
      )}

      {change.reviewStatus === 'pending' && !editing && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="primary" onClick={onAccept}>
            Aceptar
          </Button>
          <Button size="sm" variant="secondary" onClick={onStartEdit}>
            Editar
          </Button>
          <Button size="sm" variant="secondary" onClick={onReject}>
            Rechazar
          </Button>
        </div>
      )}

      {change.reviewedBy && (
        <p className="mt-3 text-[11px] text-grey-5">
          Revisado por {change.reviewedBy}
          {change.reviewedAt && ` · ${new Date(change.reviewedAt).toLocaleString('es-MX')}`}
        </p>
      )}
    </div>
  );
}
