import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckInSection } from '../../components/customer360/CheckInSection';
import { EntityValueFields } from '../../components/customer360/EntityValueFields';
import { NextStepCheckInSection } from '../../components/customer360/NextStepCheckInSection';
import { PrototypeNotice } from '../../components/customer360/PrototypeNotice';
import { RiskCheckInSection } from '../../components/customer360/RiskCheckInSection';
import { SectionHeader } from '../../components/customer360/SectionHeader';
import { describeChangeForReview, ENTITY_TYPE_LABELS, OPERATION_LABELS, UpdateChangeCard } from '../../components/customer360/UpdateChangeCard';
import { PlaceholderPage } from '../../components/shared/PlaceholderPage';
import { Button } from '../../components/ui/Button';
import {
  ADOPTION_LEVEL_OPTIONS,
  ADOPTION_TREND_OPTIONS,
  CHAMPION_LEVEL_OPTIONS,
  CHAMPION_TREND_OPTIONS,
  EXPANSION_LEVEL_OPTIONS,
  EXPANSION_TREND_OPTIONS,
  VALUE_LEVEL_OPTIONS,
  VALUE_TREND_OPTIONS,
} from '../../lib/customerUpdate/checkInConfig';
import { hasAnyCheckInContent } from '../../lib/customerUpdate/checkInTranslation';
import {
  draftFromExistingInsight,
  draftFromExistingNextAction,
  draftFromExistingRisk,
  draftFromProposedValue,
  emptyDraftValue,
  valueFromDraft,
  type EntityDraftValue,
} from '../../lib/customerUpdate/draftValue';
import { getAllInsightsForCustomer, getCustomerById, getEvidenceForCustomer, getNextActionsForCustomer, getRisksForCustomer } from '../../services/customerRepository';
import {
  addProposedCustomerChange,
  createCustomerUpdate,
  discardCustomerUpdate,
  getCustomerUpdate,
  getProposedChangesForCustomerUpdate,
  publishCustomerUpdate,
  reviewProposedCustomerChange,
  submitCheckIn,
} from '../../services/customerUpdateService';
import type { CustomerCheckIn } from '../../types/customerCheckIn';
import type { CustomerUpdateSource } from '../../types/customerUpdate';
import type { AnyProposedValue, ChangeOperation, ProposedCustomerChange, ProposedEntityType } from '../../types/proposedCustomerChange';

const SOURCE_OPTIONS: { value: CustomerUpdateSource; label: string; enabled: boolean }[] = [
  { value: 'manual_note', label: 'Nota manual', enabled: true },
  { value: 'call_transcript', label: 'Llamada con cliente (transcripción)', enabled: true },
  { value: 'uploaded_report', label: 'Reporte cargado (próximamente)', enabled: false },
  { value: 'google_chat', label: 'Google Chat (próximamente)', enabled: false },
  { value: 'email', label: 'Correo (próximamente)', enabled: false },
  { value: 'product_telemetry', label: 'Telemetría de producto (próximamente)', enabled: false },
  { value: 'automated_workflow', label: 'Flujo automatizado (próximamente)', enabled: false },
  { value: 'ai_agent', label: 'Agente de IA (próximamente)', enabled: false },
];

// Which operations are pragmatic per entity type in v0.1. Evidence is always a
// new atomic fact (create only); 'resolve' only makes sense for Risk (the only
// entity with a resolvable status).
const OPERATIONS_BY_ENTITY_TYPE: Record<ProposedEntityType, ChangeOperation[]> = {
  evidence: ['create'],
  insight: ['create', 'update', 'confirm', 'no_change'],
  risk: ['create', 'update', 'confirm', 'resolve', 'no_change'],
  next_action: ['create', 'update', 'confirm', 'no_change'],
};

const inputClass = 'w-full rounded-md border border-grey-3 bg-white px-3 py-2 text-sm text-ink focus:border-monico-blue focus:outline-none';
const labelClass = 'block text-xs font-semibold text-grey-6';

export function UpdateCustomerPage() {
  const { customerId: customerIdParam } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const customer = customerIdParam ? getCustomerById(customerIdParam) : undefined;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customerUpdateId, setCustomerUpdateId] = useState<string | null>(null);
  const [changes, setChanges] = useState<ProposedCustomerChange[]>([]);

  // Step 1
  const [source, setSource] = useState<CustomerUpdateSource>('manual_note');
  const [sourceDate, setSourceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submittedBy, setSubmittedBy] = useState('');
  const [rawInput, setRawInput] = useState('');

  // Step 2 — the primary "¿qué cambió?" check-in
  const [checkIn, setCheckIn] = useState<CustomerCheckIn>({});
  // Ids of the ProposedCustomerChanges the check-in produced last time
  // "Continuar a revisión" was clicked — used to supersede (reject, never
  // delete) still-pending ones on a re-submission after going back to Step 2.
  const [checkInChangeIds, setCheckInChangeIds] = useState<string[]>([]);

  // Step 2 — advanced mode: the original entity/operation/target authoring form,
  // now secondary and hidden behind a toggle (see product decision).
  const [advancedMode, setAdvancedMode] = useState(false);
  const [draftEntityType, setDraftEntityType] = useState<ProposedEntityType>('evidence');
  const [draftOperation, setDraftOperation] = useState<ChangeOperation>('create');
  const [draftTargetId, setDraftTargetId] = useState('');
  const [draftRationale, setDraftRationale] = useState('');
  const [draftSourceEvidenceIds, setDraftSourceEvidenceIds] = useState<string[]>([]);
  const [draftValue, setDraftValue] = useState<EntityDraftValue>(() => emptyDraftValue());

  // Step 3 — inline correction state
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EntityDraftValue>(() => emptyDraftValue());

  // Step 4
  const [publishedBy, setPublishedBy] = useState('');

  if (!customerIdParam || !customer) {
    return <PlaceholderPage eyebrow="Customer Success OS" title="Cuenta no encontrada" message="No existe una cuenta con este identificador." />;
  }

  // Narrowed once, permanently — customerIdParam's `string | undefined` type from
  // useParams doesn't stay narrowed inside the handler closures defined below.
  const customerId = customerIdParam;

  const update = customerUpdateId ? getCustomerUpdate(customerUpdateId) : undefined;
  const reviewerName = publishedBy.trim() || submittedBy.trim() || 'CSM';

  const existingRisks = getRisksForCustomer(customerId).map((risk) => ({ id: risk.id, label: risk.shortTitle ?? risk.title }));
  const existingUnresolvedRisks = getRisksForCustomer(customerId)
    .filter((risk) => risk.status !== 'resolved')
    .map((risk) => ({ id: risk.id, label: risk.shortTitle ?? risk.title }));
  const existingInsights = getAllInsightsForCustomer(customerId).map((insight) => ({ id: insight.id, label: insight.statement }));
  const existingNextActions = getNextActionsForCustomer(customerId).map((action) => ({ id: action.id, label: action.headline }));
  const existingEvidence = getEvidenceForCustomer(customerId).map((item) => ({ id: item.id, label: item.statement }));

  function existingEntitiesFor(entityType: ProposedEntityType): { id: string; label: string }[] {
    if (entityType === 'risk') return existingRisks;
    if (entityType === 'insight') return existingInsights;
    if (entityType === 'next_action') return existingNextActions;
    return [];
  }

  function targetLabelFor(change: ProposedCustomerChange): string | undefined {
    if (!change.targetEntityId) return undefined;
    return existingEntitiesFor(change.entityType).find((item) => item.id === change.targetEntityId)?.label;
  }

  function refreshChanges(id: string) {
    setChanges(getProposedChangesForCustomerUpdate(id));
  }

  function updateCheckIn<K extends keyof CustomerCheckIn>(key: K, value: CustomerCheckIn[K]) {
    setCheckIn((prev) => ({ ...prev, [key]: value }));
  }

  // The ONLY thing "Continuar a revisión" does: hand the current check-in
  // answers to the deterministic translator and advance. Never blocked by a
  // required-field check — an all-"sin cambio" check-in is a legitimate outcome
  // (nothing changed), and any pending changes from a prior submission of this
  // same check-in are superseded, not duplicated.
  function handleContinueToReview() {
    if (!customerUpdateId) return;
    const created = submitCheckIn(customerUpdateId, customerId, checkIn, checkInChangeIds, reviewerName);
    setCheckInChangeIds(created.map((change) => change.id));
    refreshChanges(customerUpdateId);
    setStep(3);
  }

  // A freshly-selected 'evidence' draft defaults its date/source from the
  // CustomerUpdate itself instead of starting blank — the most common case is
  // that every piece of evidence authored from one call/note shares both.
  function defaultDraftFor(entityType: ProposedEntityType): EntityDraftValue {
    if (entityType !== 'evidence') return emptyDraftValue();
    return emptyDraftValue({ sourceDate, source: SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? '' });
  }

  function handleCreateUpdate() {
    if (!submittedBy.trim()) return;
    const created = createCustomerUpdate({
      customerId,
      source,
      sourceDate,
      submittedBy: submittedBy.trim(),
      rawInput: rawInput.trim() || undefined,
    });
    setCustomerUpdateId(created.id);
    setDraftValue(defaultDraftFor(draftEntityType));
    setStep(2);
  }

  function handleEntityTypeChange(nextType: ProposedEntityType) {
    setDraftEntityType(nextType);
    setDraftOperation(OPERATIONS_BY_ENTITY_TYPE[nextType][0]);
    setDraftTargetId('');
    setDraftValue(defaultDraftFor(nextType));
  }

  function handleOperationChange(nextOperation: ChangeOperation) {
    setDraftOperation(nextOperation);
    setDraftTargetId('');
    setDraftValue(defaultDraftFor(draftEntityType));
  }

  function handleTargetChange(nextTargetId: string) {
    setDraftTargetId(nextTargetId);
    if (!nextTargetId) {
      setDraftValue(emptyDraftValue());
      return;
    }
    if (draftEntityType === 'risk') {
      const risk = getRisksForCustomer(customerId).find((item) => item.id === nextTargetId);
      if (risk) setDraftValue(draftFromExistingRisk(risk));
    } else if (draftEntityType === 'insight') {
      const insight = getAllInsightsForCustomer(customerId).find((item) => item.id === nextTargetId);
      if (insight) setDraftValue(draftFromExistingInsight(insight));
    } else if (draftEntityType === 'next_action') {
      const action = getNextActionsForCustomer(customerId).find((item) => item.id === nextTargetId);
      if (action) setDraftValue(draftFromExistingNextAction(action));
    }
  }

  function toggleSourceEvidence(id: string) {
    setDraftSourceEvidenceIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  // Minimal required-field guard so "Agregar cambio" can't produce an obviously
  // incomplete record (e.g. evidence with no statement/date) — pragmatic, not
  // exhaustive: it only blocks the fields a create/update value would otherwise
  // publish empty.
  function isDraftValueComplete(): boolean {
    if (draftOperation === 'confirm' || draftOperation === 'no_change' || draftOperation === 'resolve') return true;
    if (draftEntityType === 'evidence') return Boolean(draftValue.statement.trim() && draftValue.sourceDate.trim() && draftValue.category.trim());
    if (draftEntityType === 'risk') return Boolean(draftValue.title.trim() && draftValue.description.trim());
    if (draftEntityType === 'insight') return Boolean(draftValue.statement.trim());
    return Boolean(draftValue.headline.trim());
  }

  const canAddChange = (draftOperation === 'create' || Boolean(draftTargetId)) && isDraftValueComplete();

  function handleAddChange() {
    if (!customerUpdateId || !canAddChange) return;

    const common = {
      customerUpdateId,
      customerId,
      operation: draftOperation,
      targetEntityId: draftOperation === 'create' ? undefined : draftTargetId,
      rationale: draftRationale.trim() || undefined,
      sourceEvidenceIds: draftSourceEvidenceIds.length > 0 ? draftSourceEvidenceIds : undefined,
    };

    if (draftEntityType === 'evidence') {
      addProposedCustomerChange({ ...common, entityType: 'evidence', proposedValue: valueFromDraft('evidence', draftOperation, draftValue) });
    } else if (draftEntityType === 'risk') {
      addProposedCustomerChange({ ...common, entityType: 'risk', proposedValue: valueFromDraft('risk', draftOperation, draftValue) });
    } else if (draftEntityType === 'insight') {
      addProposedCustomerChange({ ...common, entityType: 'insight', proposedValue: valueFromDraft('insight', draftOperation, draftValue) });
    } else {
      addProposedCustomerChange({ ...common, entityType: 'next_action', proposedValue: valueFromDraft('next_action', draftOperation, draftValue) });
    }

    refreshChanges(customerUpdateId);
    setDraftTargetId('');
    setDraftRationale('');
    setDraftSourceEvidenceIds([]);
    setDraftValue(defaultDraftFor(draftEntityType));
  }

  function handleAccept(changeId: string) {
    if (!customerUpdateId) return;
    reviewProposedCustomerChange(changeId, { reviewStatus: 'accepted', reviewedBy: reviewerName });
    refreshChanges(customerUpdateId);
  }

  function handleReject(changeId: string) {
    if (!customerUpdateId) return;
    reviewProposedCustomerChange(changeId, { reviewStatus: 'rejected', reviewedBy: reviewerName });
    refreshChanges(customerUpdateId);
  }

  function handleStartEdit(change: ProposedCustomerChange) {
    setEditingChangeId(change.id);
    setEditDraft(draftFromProposedValue(change.proposedValue));
  }

  function handleSaveEdit(change: ProposedCustomerChange) {
    if (!customerUpdateId) return;

    let value: AnyProposedValue;
    if (change.entityType === 'evidence') {
      value = valueFromDraft('evidence', change.operation, editDraft);
    } else if (change.entityType === 'risk') {
      value = valueFromDraft('risk', change.operation, editDraft);
    } else if (change.entityType === 'insight') {
      value = valueFromDraft('insight', change.operation, editDraft);
    } else {
      value = valueFromDraft('next_action', change.operation, editDraft);
    }

    reviewProposedCustomerChange(change.id, { reviewStatus: 'edited', reviewedValue: value, reviewedBy: reviewerName });
    setEditingChangeId(null);
    refreshChanges(customerUpdateId);
  }

  function handlePublish() {
    if (!customerUpdateId || !publishedBy.trim()) return;
    publishCustomerUpdate(customerUpdateId, publishedBy.trim());
    // publishCustomerUpdate mutates the store, not React state directly — `update`
    // is read fresh from the store on every render, so re-setting `changes` here
    // (even though its contents didn't change) is what triggers that re-render.
    refreshChanges(customerUpdateId);
  }

  function handleDiscard() {
    if (!customerUpdateId) return;
    discardCustomerUpdate(customerUpdateId);
    navigate(`/customers/${customerId}`);
  }

  const acceptedCount = changes.filter((change) => change.reviewStatus === 'accepted').length;
  const editedCount = changes.filter((change) => change.reviewStatus === 'edited').length;
  const rejectedCount = changes.filter((change) => change.reviewStatus === 'rejected').length;
  const pendingCount = changes.filter((change) => change.reviewStatus === 'pending').length;

  return (
    <div className="space-y-8 pb-16 pt-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-grey-5">Customer Success OS</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">Actualizar cliente · {customer.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-6">
            Paso {step} de 4. Ningún cambio se aplica al registro canónico hasta que se publique la actualización.
          </p>
        </div>
        <PrototypeNotice />
      </header>

      {step === 1 && (
        <section className="max-w-xl space-y-4">
          <SectionHeader eyebrow="Paso 1 de 4 · Origen de la actualización" />
          <div className="space-y-3 rounded-lg border border-grey-3 bg-white p-4">
            <label className="block space-y-1">
              <span className={labelClass}>Tipo de fuente</span>
              <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value as CustomerUpdateSource)}>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} disabled={!option.enabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>Fecha de la fuente</span>
              <input type="date" className={inputClass} value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>Enviado por</span>
              <input className={inputClass} value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} placeholder="Nombre del CSM" />
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>Transcripción / notas de origen (opcional)</span>
              <textarea
                className={inputClass}
                rows={8}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Pega aquí la transcripción de la llamada o tus notas. Esto se guarda como referencia de auditoría — no se publica como hecho canónico; los cambios propuestos en el Paso 2 se redactan a mano a partir de esto."
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreateUpdate} disabled={!submittedBy.trim()}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <SectionHeader eyebrow="Paso 2 de 4 · ¿Qué cambió con este cliente?" />
          <p className="max-w-2xl text-sm text-grey-6">
            Responde solo lo que sepas — cualquier sección puede quedarse en "sin cambio". Nada se aplica a la cuenta hasta
            que revises y publiques.
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CheckInSection
              title="Valor percibido"
              levelOptions={VALUE_LEVEL_OPTIONS}
              level={checkIn.value?.level}
              onLevelChange={(level) => updateCheckIn('value', { ...checkIn.value, level })}
              trendOptions={VALUE_TREND_OPTIONS}
              trend={checkIn.value?.trend}
              onTrendChange={(trend) => updateCheckIn('value', { ...checkIn.value, trend })}
              note={checkIn.value?.note ?? ''}
              onNoteChange={(note) => updateCheckIn('value', { ...checkIn.value, note })}
              notePlaceholder="Qué cambió en el valor percibido, en tus palabras"
            />

            <CheckInSection
              title="Adopción"
              levelOptions={ADOPTION_LEVEL_OPTIONS}
              level={checkIn.adoption?.level}
              onLevelChange={(level) => updateCheckIn('adoption', { ...checkIn.adoption, level })}
              trendOptions={ADOPTION_TREND_OPTIONS}
              trend={checkIn.adoption?.trend}
              onTrendChange={(trend) => updateCheckIn('adoption', { ...checkIn.adoption, trend })}
              note={checkIn.adoption?.note ?? ''}
              onNoteChange={(note) => updateCheckIn('adoption', { ...checkIn.adoption, note })}
              notePlaceholder="Qué cambió en la adopción, en tus palabras"
            />

            <CheckInSection
              title="Champion / Engagement"
              levelOptions={CHAMPION_LEVEL_OPTIONS}
              level={checkIn.champion?.level}
              onLevelChange={(level) => updateCheckIn('champion', { ...checkIn.champion, level })}
              trendOptions={CHAMPION_TREND_OPTIONS}
              trend={checkIn.champion?.trend}
              onTrendChange={(trend) => updateCheckIn('champion', { ...checkIn.champion, trend })}
              note={checkIn.champion?.note ?? ''}
              onNoteChange={(note) => updateCheckIn('champion', { ...checkIn.champion, note })}
              notePlaceholder="Qué cambió con el champion o los stakeholders"
            />

            <RiskCheckInSection value={checkIn.risk ?? {}} onChange={(risk) => updateCheckIn('risk', risk)} existingUnresolvedRisks={existingUnresolvedRisks} />

            <CheckInSection
              title="Expansión"
              levelOptions={EXPANSION_LEVEL_OPTIONS}
              level={checkIn.expansion?.level}
              onLevelChange={(level) => updateCheckIn('expansion', { ...checkIn.expansion, level })}
              trendOptions={EXPANSION_TREND_OPTIONS}
              trend={checkIn.expansion?.trend}
              onTrendChange={(trend) => updateCheckIn('expansion', { ...checkIn.expansion, trend })}
              note={checkIn.expansion?.note ?? ''}
              onNoteChange={(note) => updateCheckIn('expansion', { ...checkIn.expansion, note })}
              notePlaceholder="Qué está impulsando o deteniendo una posible expansión"
            />

            <NextStepCheckInSection value={checkIn.nextStep ?? {}} onChange={(nextStep) => updateCheckIn('nextStep', nextStep)} />
          </div>

          {!hasAnyCheckInContent(checkIn) && changes.filter((change) => change.reviewStatus !== 'rejected').length === 0 && (
            <p className="text-xs text-grey-5">Aún no respondiste nada — puedes continuar igual si no hay cambios que registrar.</p>
          )}

          <div>
            <button type="button" className="text-xs font-semibold text-monico-blue hover:underline" onClick={() => setAdvancedMode((prev) => !prev)}>
              {advancedMode ? '– Ocultar cambio avanzado' : '+ Agregar cambio avanzado'}
            </button>

            {advancedMode && (
              <div className="mt-3 space-y-3 rounded-lg border border-grey-3 bg-grey-1 p-4">
                <p className="text-xs text-grey-5">
                  Modo avanzado: edita directamente un objeto de dominio y su operación (crear/actualizar/confirmar/resolver/sin
                  cambio) sobre un registro existente. El check-in de arriba cubre la mayoría de los casos — usa esto solo si
                  necesitas apuntar a un Riesgo, Insight o Próxima acción específicos.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className={labelClass}>Tipo de entidad</span>
                    <select className={inputClass} value={draftEntityType} onChange={(e) => handleEntityTypeChange(e.target.value as ProposedEntityType)}>
                      {(Object.keys(ENTITY_TYPE_LABELS) as ProposedEntityType[]).map((entityType) => (
                        <option key={entityType} value={entityType}>
                          {ENTITY_TYPE_LABELS[entityType]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className={labelClass}>Operación</span>
                    <select className={inputClass} value={draftOperation} onChange={(e) => handleOperationChange(e.target.value as ChangeOperation)}>
                      {OPERATIONS_BY_ENTITY_TYPE[draftEntityType].map((operation) => (
                        <option key={operation} value={operation}>
                          {OPERATION_LABELS[operation]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {draftOperation !== 'create' && (
                  <label className="block space-y-1">
                    <span className={labelClass}>Entidad existente</span>
                    <select className={inputClass} value={draftTargetId} onChange={(e) => handleTargetChange(e.target.value)}>
                      <option value="">— selecciona —</option>
                      {existingEntitiesFor(draftEntityType).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {(draftOperation === 'create' || draftOperation === 'update') && (
                  <EntityValueFields
                    entityType={draftEntityType}
                    value={draftValue}
                    onChange={setDraftValue}
                    existingRisks={existingRisks}
                    existingInsights={existingInsights}
                  />
                )}

                {draftOperation === 'resolve' && (
                  <label className="block space-y-1">
                    <span className={labelClass}>Nota de cierre (opcional)</span>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={draftValue.shortCause}
                      onChange={(e) => setDraftValue({ ...draftValue, shortCause: e.target.value })}
                    />
                  </label>
                )}

                <label className="block space-y-1">
                  <span className={labelClass}>Justificación (opcional)</span>
                  <textarea className={inputClass} rows={2} value={draftRationale} onChange={(e) => setDraftRationale(e.target.value)} />
                </label>

                {existingEvidence.length > 0 && (
                  <div>
                    <span className={labelClass}>Evidencia relacionada (opcional)</span>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {existingEvidence.map((item) => (
                        <label key={item.id} className="flex items-center gap-1 text-xs text-grey-6">
                          <input type="checkbox" checked={draftSourceEvidenceIds.includes(item.id)} onChange={() => toggleSourceEvidence(item.id)} />
                          {item.label.length > 48 ? `${item.label.slice(0, 48)}…` : item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleAddChange} disabled={!canAddChange}>
                    Agregar cambio
                  </Button>
                </div>
              </div>
            )}
          </div>

          {changes.filter((change) => change.reviewStatus !== 'rejected').length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-grey-5">
                {changes.filter((change) => change.reviewStatus !== 'rejected').length} cambio(s) listo(s) para revisión
              </p>
              <ul className="mt-2 space-y-1 text-sm text-grey-6">
                {changes
                  .filter((change) => change.reviewStatus !== 'rejected')
                  .map((change) => (
                    <li key={change.id}>
                      {describeChangeForReview(change)}
                      {targetLabelFor(change) && ` · ${targetLabelFor(change)}`}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleDiscard}>
              Descartar actualización
            </Button>
            <Button variant="primary" onClick={handleContinueToReview}>
              Continuar a revisión
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <SectionHeader eyebrow="Paso 3 de 4 · Revisión humana" />
          <div className="space-y-3">
            {changes.map((change) => (
              <UpdateChangeCard
                key={change.id}
                change={change}
                targetLabel={targetLabelFor(change)}
                sourceEvidenceLabels={(change.sourceEvidenceIds ?? []).map((id) => existingEvidence.find((item) => item.id === id)?.label ?? id)}
                editing={
                  editingChangeId === change.id ? (
                    <div className="space-y-3">
                      <EntityValueFields
                        entityType={change.entityType}
                        value={editDraft}
                        onChange={setEditDraft}
                        existingRisks={existingRisks}
                        existingInsights={existingInsights}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => handleSaveEdit(change)}>
                          Guardar edición
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingChangeId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : undefined
                }
                onAccept={() => handleAccept(change.id)}
                onStartEdit={() => handleStartEdit(change)}
                onReject={() => handleReject(change.id)}
              />
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Volver a redacción
            </Button>
            <Button variant="primary" onClick={() => setStep(4)}>
              Continuar a publicación
            </Button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="max-w-xl space-y-4">
          <SectionHeader eyebrow="Paso 4 de 4 · Publicar" />
          <div className="rounded-lg border border-grey-3 bg-white p-4">
            <p className="text-sm text-ink">
              {acceptedCount} aceptado(s) · {editedCount} editado(s) · {rejectedCount} rechazado(s)
              {pendingCount > 0 && ` · ${pendingCount} pendiente(s) sin revisar`}
            </p>
            {pendingCount > 0 && (
              <p className="mt-2 text-xs text-health-yellow">
                Hay cambios sin revisar — no se publicarán hasta que se acepten, editen o rechacen. Puedes volver al Paso 3.
              </p>
            )}

            {update?.status === 'published' ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-health-green">Actualización publicada.</p>
                <Link to={`/customers/${customerId}`}>
                  <Button variant="primary">Ver cuenta de {customer.name}</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block space-y-1">
                  <span className={labelClass}>Publicado por</span>
                  <input className={inputClass} value={publishedBy} onChange={(e) => setPublishedBy(e.target.value)} placeholder="Nombre del CSM" />
                </label>
                <Button variant="primary" onClick={handlePublish} disabled={!publishedBy.trim()}>
                  Publicar actualización
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
