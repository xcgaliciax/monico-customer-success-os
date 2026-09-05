import { CheckInPill } from './CheckInPill';
import { BLOCKER_CHANGE_STATUS_OPTIONS, IS_NEW_BLOCKER_OPTIONS, RISK_LEVEL_OPTIONS } from '../../lib/customerUpdate/checkInConfig';
import type { BlockerChangeStatus, CheckInLevel, RiskCheckIn } from '../../types/customerCheckIn';

const inputClass = 'w-full rounded-md border border-grey-3 bg-white px-3 py-2 text-sm text-ink focus:border-monico-blue focus:outline-none';
const labelClass = 'block text-xs font-semibold text-grey-6';

interface RiskCheckInSectionProps {
  value: RiskCheckIn;
  onChange: (next: RiskCheckIn) => void;
  // The customer's own unresolved Risks, as plain labels — no ids are ever
  // rendered to the CSM (product decision 2).
  existingUnresolvedRisks: { id: string; label: string }[];
}

// Riesgo / Blockers. A blocker is only ever proposed as a NEW Risk when the CSM
// says it's new and describes it; an already-tracked blocker is confirmed/
// updated/resolved against the customer's own unresolved Risks instead of ever
// creating a duplicate — see lib/customerUpdate/checkInTranslation.ts. The CSM
// never sees "create/update/confirm/resolve" or any entity id anywhere here.
export function RiskCheckInSection({ value, onChange, existingUnresolvedRisks }: RiskCheckInSectionProps) {
  const setLevel = (level: CheckInLevel) => onChange({ ...value, level });
  const setHasBlocker = (hasBlocker: boolean) =>
    onChange({
      ...value,
      hasBlocker,
      ...(hasBlocker ? {} : { isNewBlocker: undefined, blockerDescription: undefined, existingRiskId: undefined, changeStatus: undefined, changeNote: undefined }),
    });
  const setIsNewBlocker = (isNewBlocker: boolean) =>
    onChange({ ...value, isNewBlocker, existingRiskId: undefined, changeStatus: undefined, changeNote: undefined, blockerDescription: isNewBlocker ? value.blockerDescription : undefined });
  const setChangeStatus = (changeStatus: BlockerChangeStatus) => onChange({ ...value, changeStatus });

  return (
    <div className="space-y-3 rounded-lg border border-grey-3 bg-white p-4">
      <h3 className="text-sm font-bold text-ink">Riesgo / Blockers</h3>

      <div>
        <span className={labelClass}>Estado actual</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {RISK_LEVEL_OPTIONS.map((option) => (
            <CheckInPill key={option.value} label={option.label} color={option.color} active={value.level === option.value} onClick={() => setLevel(option.value)} />
          ))}
        </div>
      </div>

      <div>
        <span className={labelClass}>¿Hay algún blocker o dependencia relevante?</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <CheckInPill label="No" color="green" active={value.hasBlocker === false} onClick={() => setHasBlocker(false)} />
          <CheckInPill label="Sí" color="red" active={value.hasBlocker === true} onClick={() => setHasBlocker(true)} />
        </div>
      </div>

      {value.hasBlocker && (
        <>
          <div>
            <span className={labelClass}>¿Este blocker es nuevo?</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {IS_NEW_BLOCKER_OPTIONS.map((option) => (
                <CheckInPill
                  key={option.value}
                  label={option.label}
                  color={option.color}
                  active={value.isNewBlocker === (option.value === 'true')}
                  onClick={() => setIsNewBlocker(option.value === 'true')}
                />
              ))}
            </div>
          </div>

          {value.isNewBlocker === true && (
            <label className="block space-y-1">
              <span className={labelClass}>Describe brevemente el blocker</span>
              <textarea
                className={inputClass}
                rows={2}
                value={value.blockerDescription ?? ''}
                onChange={(e) => onChange({ ...value, blockerDescription: e.target.value })}
                placeholder="Qué está bloqueado y por qué"
              />
            </label>
          )}

          {value.isNewBlocker === false && (
            <>
              <label className="block space-y-1">
                <span className={labelClass}>¿Cuál blocker?</span>
                {existingUnresolvedRisks.length > 0 ? (
                  <select className={inputClass} value={value.existingRiskId ?? ''} onChange={(e) => onChange({ ...value, existingRiskId: e.target.value || undefined })}>
                    <option value="">— selecciona —</option>
                    {existingUnresolvedRisks.map((risk) => (
                      <option key={risk.id} value={risk.id}>
                        {risk.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-grey-5">No hay blockers abiertos registrados para esta cuenta todavía.</p>
                )}
              </label>

              {value.existingRiskId && (
                <>
                  <div>
                    <span className={labelClass}>¿Qué pasó con este blocker?</span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {BLOCKER_CHANGE_STATUS_OPTIONS.map((option) => (
                        <CheckInPill key={option.value} label={option.label} color={option.color} active={value.changeStatus === option.value} onClick={() => setChangeStatus(option.value)} />
                      ))}
                    </div>
                  </div>

                  <label className="block space-y-1">
                    <span className={labelClass}>Nota (opcional)</span>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={value.changeNote ?? ''}
                      onChange={(e) => onChange({ ...value, changeNote: e.target.value })}
                      placeholder="Qué cambió específicamente, en tus palabras"
                    />
                  </label>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
