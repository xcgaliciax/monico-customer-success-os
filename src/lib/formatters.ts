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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export function formatTokens(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}

export function formatUsd2(amount: number): string {
  return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
