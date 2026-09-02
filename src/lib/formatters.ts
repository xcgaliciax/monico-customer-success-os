export function formatCurrency(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

// Compact form for headline aggregates, e.g. 66204 -> "USD 66.2K".
export function formatArrCompact(usd: number): string {
  return `USD ${(usd / 1000).toFixed(1)}K`;
}

const LONG_MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// Full Spanish LATAM date, e.g. "1 de septiembre de 2026" — fixed table rather
// than Intl so the product's date copy never regresses to an English locale.
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return `${date.getDate()} de ${LONG_MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`;
}

const SHORT_MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Spec §02 "Indicador de snapshot" / §09 timeline dates: mono, lowercase, short
// Spanish month — e.g. "1 sep 2026". Fixed table rather than Intl so the exact
// three-letter form matches the approved screens regardless of ICU locale data.
export function formatMonoDateShort(iso: string, options?: { withYear?: boolean }): string {
  const date = new Date(`${iso}T00:00:00`);
  const day = date.getDate();
  const month = SHORT_MONTHS_ES[date.getMonth()];
  const withYear = options?.withYear ?? true;
  return withYear ? `${day} ${month} ${date.getFullYear()}` : `${day} ${month}`;
}

// Month-level precision date, e.g. "abr 2026" — for facts the source only dates to
// a month (kickoff months, implementation windows), never a fabricated exact day.
export function formatMonthYearEs(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return `${SHORT_MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTokens(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}

export function formatUsd2(amount: number): string {
  return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
