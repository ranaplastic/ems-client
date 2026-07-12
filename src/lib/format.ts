import { format, parseISO } from 'date-fns';

/** Format a number as Indian Rupee currency. */
export function formatCurrency(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Format a quantity with up to 2 decimals, trimming trailing zeros. */
export function formatQuantity(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
}

/** Format an ISO date/datetime string as a readable date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch {
    return value;
  }
}

/** Today's date as an ISO yyyy-MM-dd string (for date inputs). */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Human-readable label for enum-like values (FINISHED → Finished). */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
