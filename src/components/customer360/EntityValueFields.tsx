import type { ReactNode } from 'react';
import type { EntityDraftValue } from '../../lib/customerUpdate/draftValue';
import { CONFIDENCE_LABELS_ES, EVIDENCE_TYPE_LABELS_ES, IMPACT_LABELS_ES } from '../../lib/labels';
import type { ProposedEntityType } from '../../types/proposedCustomerChange';

const RISK_SEVERITY_OPTIONS: { value: EntityDraftValue['severity']; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

const RISK_STATUS_OPTIONS: { value: EntityDraftValue['status']; label: string }[] = [
  { value: 'open', label: 'Abierto' },
  { value: 'monitoring', label: 'En seguimiento' },
  { value: 'resolved', label: 'Resuelto' },
];

const INSIGHT_SECTION_OPTIONS: { value: EntityDraftValue['section']; label: string }[] = [
  { value: 'why_score', label: 'Por qué este puntaje' },
  { value: 'adoption', label: 'Insights de adopción' },
];

const NEXT_ACTION_SCOPE_OPTIONS: { value: EntityDraftValue['scope']; label: string }[] = [
  { value: 'summary', label: 'Resumen (cuenta)' },
  { value: 'risk', label: 'Ligada a un riesgo' },
  { value: 'opportunity', label: 'Ligada a una oportunidad' },
  { value: 'health', label: 'Salud' },
  { value: 'adoption', label: 'Adopción' },
  { value: 'value', label: 'Valor' },
  { value: 'risks', label: 'Pestaña de riesgos' },
];

const inputClass = 'w-full rounded-md border border-grey-3 bg-white px-3 py-2 text-sm text-ink focus:border-monico-blue focus:outline-none';
const labelClass = 'block text-xs font-semibold text-grey-6';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

interface EntityValueFieldsProps {
  entityType: ProposedEntityType;
  value: EntityDraftValue;
  onChange: (next: EntityDraftValue) => void;
  existingRisks: { id: string; label: string }[];
  existingInsights: { id: string; label: string }[];
}

// Renders only the fields relevant to `entityType` from the shared EntityDraftValue
// bag. Reused for authoring a create/update proposal (Step 2) and for correcting a
// proposal in review (Step 3, "Editar") — same fields, same conversion, one place.
export function EntityValueFields({ entityType, value, onChange, existingRisks, existingInsights }: EntityValueFieldsProps) {
  const set = <K extends keyof EntityDraftValue>(key: K, next: EntityDraftValue[K]) => onChange({ ...value, [key]: next });

  if (entityType === 'evidence') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Declaración">
            <textarea
              className={inputClass}
              rows={2}
              value={value.statement}
              onChange={(e) => set('statement', e.target.value)}
              placeholder="Qué se observó o dijo, en una frase"
            />
          </Field>
        </div>
        <Field label="Tipo">
          <select className={inputClass} value={value.type} onChange={(e) => set('type', e.target.value as EntityDraftValue['type'])}>
            {Object.entries(EVIDENCE_TYPE_LABELS_ES).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Categoría">
          <input className={inputClass} value={value.category} onChange={(e) => set('category', e.target.value)} placeholder="p. ej. workflow_adoption" />
        </Field>
        <Field label="Fuente">
          <input className={inputClass} value={value.source} onChange={(e) => set('source', e.target.value)} />
        </Field>
        <Field label="Fecha">
          <input type="date" className={inputClass} value={value.sourceDate} onChange={(e) => set('sourceDate', e.target.value)} />
        </Field>
        <Field label="Confianza">
          <select className={inputClass} value={value.confidence} onChange={(e) => set('confidence', e.target.value as EntityDraftValue['confidence'])}>
            {Object.entries(CONFIDENCE_LABELS_ES).map(([conf, label]) => (
              <option key={conf} value={conf}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Impacto">
          <select className={inputClass} value={value.impact} onChange={(e) => set('impact', e.target.value as EntityDraftValue['impact'])}>
            {Object.entries(IMPACT_LABELS_ES).map(([impact, label]) => (
              <option key={impact} value={impact}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm text-ink">
          <input type="checkbox" checked={value.verified} onChange={(e) => set('verified', e.target.checked)} />
          Verificado independientemente
        </label>
      </div>
    );
  }

  if (entityType === 'risk') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Título">
            <input className={inputClass} value={value.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Descripción">
            <textarea className={inputClass} rows={2} value={value.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Severidad">
          <select className={inputClass} value={value.severity} onChange={(e) => set('severity', e.target.value as EntityDraftValue['severity'])}>
            {RISK_SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select className={inputClass} value={value.status} onChange={(e) => set('status', e.target.value as EntityDraftValue['status'])}>
            {RISK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título corto (opcional)">
          <input className={inputClass} value={value.shortTitle} onChange={(e) => set('shortTitle', e.target.value)} />
        </Field>
        <Field label="Causa corta (opcional)">
          <input className={inputClass} value={value.shortCause} onChange={(e) => set('shortCause', e.target.value)} />
        </Field>
        <Field label="Owner (opcional)">
          <input className={inputClass} value={value.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
      </div>
    );
  }

  if (entityType === 'insight') {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Field label="Sección">
          <select className={inputClass} value={value.section} onChange={(e) => set('section', e.target.value as EntityDraftValue['section'])}>
            {INSIGHT_SECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Enunciado">
          <textarea className={inputClass} rows={2} value={value.statement} onChange={(e) => set('statement', e.target.value)} />
        </Field>
        <Field label="Contexto (opcional)">
          <textarea className={inputClass} rows={2} value={value.context} onChange={(e) => set('context', e.target.value)} />
        </Field>
      </div>
    );
  }

  // next_action
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Alcance">
        <select className={inputClass} value={value.scope} onChange={(e) => set('scope', e.target.value as EntityDraftValue['scope'])}>
          {NEXT_ACTION_SCOPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Meta (opcional)">
        <input className={inputClass} value={value.meta} onChange={(e) => set('meta', e.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Titular">
          <input className={inputClass} value={value.headline} onChange={(e) => set('headline', e.target.value)} />
        </Field>
      </div>
      <Field label="Riesgo relacionado (opcional)">
        <select className={inputClass} value={value.relatedRiskId} onChange={(e) => set('relatedRiskId', e.target.value)}>
          <option value="">— ninguno —</option>
          {existingRisks.map((risk) => (
            <option key={risk.id} value={risk.id}>
              {risk.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Insight relacionado (opcional)">
        <select className={inputClass} value={value.relatedInsightId} onChange={(e) => set('relatedInsightId', e.target.value)}>
          <option value="">— ninguno —</option>
          {existingInsights.map((insight) => (
            <option key={insight.id} value={insight.id}>
              {insight.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
