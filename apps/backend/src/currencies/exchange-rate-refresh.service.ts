import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ExchangeRateRefreshService {
  private readonly logger = new Logger(ExchangeRateRefreshService.name);

  constructor(private prisma: PrismaService) {}

  async refreshUsdMmkFromApi(): Promise<{ rate: number; source: string }> {
    let rate = 3500;
    let source = 'fallback';

    try {
      const res = await fetch(
        'https://api.exchangerate.host/latest?base=USD&symbols=MMK',
      );
      const json = (await res.json()) as { rates?: { MMK?: number } };
      if (json.rates?.MMK) {
        rate = json.rates.MMK;
        source = 'exchangerate.host';
      }
    } catch (err) {
      this.logger.warn(
        'External rate fetch failed',
        err,
      );
      // If external fetch fails, we just don't update anything and return existing
      const existing = await this.prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: { code: 'USD' },
          toCurrency: { code: 'MMK' },
        },
      });
      return { 
        rate: Number(existing?.rate ?? 3500), 
        source: 'existing_record' 
      };
    }

    const usd = await this.prisma.currency.findUnique({ where: { code: 'USD' } });
    const mmk = await this.prisma.currency.findUnique({ where: { code: 'MMK' } });

    if (usd && mmk) {
      await this.prisma.exchangeRate.upsert({
        where: {
          fromCurrencyId_toCurrencyId: {
            fromCurrencyId: usd.id,
            toCurrencyId: mmk.id,
          },
        },
        create: {
          fromCurrencyId: usd.id,
          toCurrencyId: mmk.id,
          rate,
          lastFetchedAt: new Date(),
          isManualOverride: false,
        },
        update: {
          rate,
          lastFetchedAt: new Date(),
          isManualOverride: false,
        },
      });
    }

    return { rate, source };
  }
}
