export const SUPPORTED_CURRENCIES = ['USD', 'MMK', 'THB'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export function currencyCodeFromIsUsd(isUsd: boolean): CurrencyCode {
  return isUsd ? 'USD' : 'MMK';
}

export function isUsdFromCurrencyCode(code: string): boolean {
  return code === 'USD';
}

export function normalizePrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number,
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD' && toCurrency === 'MMK') return amount * rate;
  if (fromCurrency === 'MMK' && toCurrency === 'USD') return amount / rate;
  return amount;
}

export function toUsd(
  amount: number,
  currencyCode: string,
  usdToTargetRate: number,
): number {
  if (currencyCode === 'USD') return amount;
  if (currencyCode === 'MMK') return amount / usdToTargetRate;
  return amount;
}
