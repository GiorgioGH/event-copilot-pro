/**
 * Currency conversion utilities
 * Current rate: 1 USD = 6.8 DKK (approximate as of 2024)
 */
export const USD_TO_DKK_RATE = 6.8;

/**
 * Convert USD to DKK
 */
export function usdToDkk(usd: number): number {
  return Math.round(usd * USD_TO_DKK_RATE);
}

/**
 * Format DKK currency
 */
export function formatDkk(amount: number): string {
  return `${amount.toLocaleString('da-DK')} DKK`;
}

/**
 * Format DKK currency with decimals
 */
export function formatDkkDecimal(amount: number): string {
  return `${amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DKK`;
}

