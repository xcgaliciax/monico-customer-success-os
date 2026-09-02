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
