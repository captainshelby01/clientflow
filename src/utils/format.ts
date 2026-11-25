import { CurrencyCode } from '../types/crm';

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; locale: string; rateFromUSD: number }
> = {
  USD: { symbol: '$', locale: 'en-US', rateFromUSD: 1 },
  GBP: { symbol: '£', locale: 'en-GB', rateFromUSD: 0.79 },
  EUR: { symbol: '€', locale: 'de-DE', rateFromUSD: 0.92 },
  NGN: { symbol: '₦', locale: 'en-NG', rateFromUSD: 1550 },
};

export function formatCurrency(
  amountInUSD: number,
  currency: CurrencyCode = 'USD',
  compact = false
): string {
  const cfg = CURRENCY_CONFIG[currency];
  const converted = Math.round(amountInUSD * cfg.rateFromUSD);

  if (compact) {
    if (converted >= 1_000_000) {
      return `${cfg.symbol}${(converted / 1_000_000).toFixed(1)}M`;
    }
    if (converted >= 10_000) {
      return `${cfg.symbol}${Math.round(converted / 1_000)}k`;
    }
    if (converted >= 1_000) {
      return `${cfg.symbol}${(converted / 1_000).toFixed(1)}k`;
    }
  }

  return `${cfg.symbol}${converted.toLocaleString('en-US')}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIG[currency].symbol;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'CF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
