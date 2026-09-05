// Structured "what changed with this customer" check-in — the primary Step 2
// input model. This is deliberately NOT a domain entity (not Evidence/Insight/
// Risk/NextAction): it's the raw, CSM-friendly shape captured before any
// translation happens, kept alongside the ProposedCustomerChanges it produces
// (see lib/customerUpdate/checkInTranslation.ts) so an answer that didn't
// produce a canonical entity is still preserved on the CustomerUpdate audit
// record, rather than silently discarded. See CustomerUpdate.checkIn.
export type CheckInLevel = 'low' | 'medium' | 'high';
export type CheckInTrend = 'down' | 'same' | 'up';
export type ExpansionLevel = 'none' | 'possible' | 'active';

export type NextStepOption =
  | 'follow_up'
  | 'schedule_session'
  | 'validate_adoption'
  | 'resolve_blocker'
  | 'confirm_expansion'
  | 'prepare_next_phase'
  | 'other';

// Valor percibido / Adopción / Champion·Engagement share this shape.
export interface DimensionCheckIn {
  level?: CheckInLevel;
  trend?: CheckInTrend;
  note?: string;
}

// What happened to an already-tracked blocker since the last check-in — replaces
// a generic "trend" pill for Risk: "Sigue igual" -> Risk CONFIRM, "Mejoró"/
// "Empeoró" -> Risk UPDATE, "Se resolvió" -> Risk RESOLVE. See checkInTranslation.ts.
export type BlockerChangeStatus = 'same' | 'improved' | 'worsened' | 'resolved';

export interface RiskCheckIn {
  level?: CheckInLevel; // general rating — stored only, never published (rule 4)
  hasBlocker?: boolean;
  // Set once hasBlocker === true: true = a brand-new blocker (needs description,
  // proposes a new Risk); false = reporting on an already-tracked one (needs
  // existingRiskId + changeStatus, never creates a duplicate Risk).
  isNewBlocker?: boolean;
  blockerDescription?: string; // new blocker's description — required to propose anything when isNewBlocker
  existingRiskId?: string; // selected from the customer's own unresolved Risks — never shown to the CSM as an id, only as a label
  changeStatus?: BlockerChangeStatus;
  changeNote?: string; // optional — what specifically changed, used verbatim, never fabricated
}

export interface ExpansionCheckIn {
  level?: ExpansionLevel;
  trend?: CheckInTrend;
  note?: string;
}

export interface NextStepCheckIn {
  option?: NextStepOption;
  detail?: string;
}

export interface CustomerCheckIn {
  value?: DimensionCheckIn;
  adoption?: DimensionCheckIn;
  champion?: DimensionCheckIn;
  risk?: RiskCheckIn;
  expansion?: ExpansionCheckIn;
  nextStep?: NextStepCheckIn;
}
