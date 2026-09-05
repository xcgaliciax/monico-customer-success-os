import type { BlockerChangeStatus, CheckInLevel, CheckInTrend, ExpansionLevel, NextStepOption } from '../../types/customerCheckIn';

export type PillColor = 'green' | 'yellow' | 'red' | 'neutral';

export interface PillOption<V extends string> {
  value: V;
  label: string;
  color: PillColor;
}

// Each section defines its own explicit label/color per option rather than
// deriving one from a shared "higher is better" rule — Riesgo's polarity is
// inverted from Valor/Adopción/Champion (bajo riesgo = verde, alto riesgo =
// rojo), so a generic derivation would get one of the two backwards.
export const VALUE_LEVEL_OPTIONS: PillOption<CheckInLevel>[] = [
  { value: 'low', label: 'Bajo', color: 'red' },
  { value: 'medium', label: 'Medio', color: 'yellow' },
  { value: 'high', label: 'Alto', color: 'green' },
];

export const VALUE_TREND_OPTIONS: PillOption<CheckInTrend>[] = [
  { value: 'down', label: 'Empeoró', color: 'red' },
  { value: 'same', label: 'Sin cambio', color: 'neutral' },
  { value: 'up', label: 'Mejoró', color: 'green' },
];

export const ADOPTION_LEVEL_OPTIONS: PillOption<CheckInLevel>[] = [
  { value: 'low', label: 'Baja', color: 'red' },
  { value: 'medium', label: 'Media', color: 'yellow' },
  { value: 'high', label: 'Alta', color: 'green' },
];

export const ADOPTION_TREND_OPTIONS: PillOption<CheckInTrend>[] = [
  { value: 'down', label: 'Bajando', color: 'red' },
  { value: 'same', label: 'Estable', color: 'neutral' },
  { value: 'up', label: 'Subiendo', color: 'green' },
];

export const CHAMPION_LEVEL_OPTIONS: PillOption<CheckInLevel>[] = [
  { value: 'low', label: 'Débil', color: 'red' },
  { value: 'medium', label: 'Adecuado', color: 'yellow' },
  { value: 'high', label: 'Fuerte', color: 'green' },
];

export const CHAMPION_TREND_OPTIONS: PillOption<CheckInTrend>[] = VALUE_TREND_OPTIONS;

export const RISK_LEVEL_OPTIONS: PillOption<CheckInLevel>[] = [
  { value: 'low', label: 'Bajo', color: 'green' },
  { value: 'medium', label: 'Medio', color: 'yellow' },
  { value: 'high', label: 'Alto', color: 'red' },
];

// "¿Este blocker es nuevo?" — the CSM never sees create/update/confirm/resolve;
// this Sí/No choice is what the translation layer maps onto those operations.
export const IS_NEW_BLOCKER_OPTIONS: PillOption<'true' | 'false'>[] = [
  { value: 'true', label: 'Sí, es nuevo', color: 'neutral' },
  { value: 'false', label: 'No, ya lo estamos siguiendo', color: 'neutral' },
];

// "¿Qué pasó con este blocker?" — translated internally to Risk operations:
// same -> confirm, improved/worsened -> update, resolved -> resolve.
export const BLOCKER_CHANGE_STATUS_OPTIONS: PillOption<BlockerChangeStatus>[] = [
  { value: 'same', label: 'Sigue igual', color: 'neutral' },
  { value: 'improved', label: 'Mejoró', color: 'green' },
  { value: 'worsened', label: 'Empeoró', color: 'red' },
  { value: 'resolved', label: 'Se resolvió', color: 'green' },
];

export const BLOCKER_CHANGE_STATUS_LABELS: Record<BlockerChangeStatus, string> = Object.fromEntries(
  BLOCKER_CHANGE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<BlockerChangeStatus, string>;

export const EXPANSION_LEVEL_OPTIONS: PillOption<ExpansionLevel>[] = [
  { value: 'none', label: 'Sin señal', color: 'neutral' },
  { value: 'possible', label: 'Posible', color: 'yellow' },
  { value: 'active', label: 'Activa', color: 'green' },
];

export const EXPANSION_TREND_OPTIONS: PillOption<CheckInTrend>[] = [
  { value: 'down', label: 'Bajó', color: 'red' },
  { value: 'same', label: 'Sin cambio', color: 'neutral' },
  { value: 'up', label: 'Aumentó', color: 'green' },
];

export const NEXT_STEP_OPTIONS: PillOption<NextStepOption>[] = [
  { value: 'follow_up', label: 'Dar seguimiento', color: 'neutral' },
  { value: 'schedule_session', label: 'Agendar sesión', color: 'neutral' },
  { value: 'validate_adoption', label: 'Validar adopción', color: 'neutral' },
  { value: 'resolve_blocker', label: 'Resolver blocker', color: 'neutral' },
  { value: 'confirm_expansion', label: 'Confirmar expansión', color: 'neutral' },
  { value: 'prepare_next_phase', label: 'Preparar siguiente fase', color: 'neutral' },
  { value: 'other', label: 'Otro', color: 'neutral' },
];

export const NEXT_STEP_LABELS: Record<NextStepOption, string> = Object.fromEntries(
  NEXT_STEP_OPTIONS.map((option) => [option.value, option.label]),
) as Record<NextStepOption, string>;
