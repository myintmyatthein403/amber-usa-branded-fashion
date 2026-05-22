import { z } from 'zod';

export const CurrencySchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(2, 'Currency code is required').max(3),
  name: z.string().min(1, 'Currency name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  isBase: z.boolean().default(false),
  isActive: z.boolean().default(true),
  decimalPlaces: z.number().min(0).max(4).default(2),
  position: z.enum(['prefix', 'suffix']).default('prefix'),
});

export const ExchangeRateSchema = z.object({
  id: z.string().uuid().optional(),
  fromCurrencyId: z.string().uuid(),
  toCurrencyId: z.string().uuid(),
  rate: z.number().positive('Rate must be positive'),
  effectiveDate: z.string().optional(),
  lastFetchedAt: z.string().nullable().optional(),
  isManualOverride: z.boolean().optional(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

export type CurrencyWithRates = Currency & {
  exchangeRates?: ExchangeRate[];
};