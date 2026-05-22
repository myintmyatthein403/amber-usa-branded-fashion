import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UsdMmkRateMeta {
  rate: number;
  lastFetchedAt: string | null;
  isManualOverride: boolean;
  rateSource: 'exchange_rates' | 'settings_fallback';
}

@Injectable()
export class ExchangeRateHelper {
  constructor(private prisma: PrismaService) {}

  async getUsdMmkMeta(): Promise<UsdMmkRateMeta> {
    const usd = await this.prisma.currency.findUnique({ where: { code: 'USD' } });
    const mmk = await this.prisma.currency.findUnique({ where: { code: 'MMK' } });

    if (usd && mmk) {
      const pair = await this.prisma.exchangeRate.findUnique({
        where: {
          fromCurrencyId_toCurrencyId: {
            fromCurrencyId: usd.id,
            toCurrencyId: mmk.id,
          },
        },
      });
      if (pair) {
        return {
          rate: Number(pair.rate),
          lastFetchedAt: pair.lastFetchedAt?.toISOString() ?? null,
          isManualOverride: pair.isManualOverride ?? false,
          rateSource: 'exchange_rates',
        };
      }
    }

    // Backup: Search by codes if IDs don't match for some reason
    const backupPair = await this.prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: { code: 'USD' },
        toCurrency: { code: 'MMK' },
      },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    if (backupPair) {
      return {
        rate: Number(backupPair.rate),
        lastFetchedAt: backupPair.lastFetchedAt?.toISOString() ?? null,
        isManualOverride: backupPair.isManualOverride ?? false,
        rateSource: 'exchange_rates',
      };
    }

    return {
      rate: 3500,
      lastFetchedAt: null,
      isManualOverride: false,
      rateSource: 'settings_fallback',
    };
  }

  async getUsdToMmkRate(): Promise<number> {
    const meta = await this.getUsdMmkMeta();
    return meta.rate;
  }

  async getRateForOrder(currency: string): Promise<number> {
    if (currency === 'USD') return 1;
    if (currency === 'MMK') return await this.getUsdToMmkRate();
    return 1;
  }
}
