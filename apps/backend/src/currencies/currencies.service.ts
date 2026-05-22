import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrenciesRepository } from './currencies.repository';
import { ExchangeRatesRepository } from './exchange-rates.repository';

@Injectable()
export class CurrenciesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(
    private prisma: PrismaService,
    private currenciesRepo: CurrenciesRepository,
    private exchangeRatesRepo: ExchangeRatesRepository,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.ensureDefaultCurrenciesAndRate();
      this.logger.log('Currency defaults verified (USD, MMK, USD→MMK rate)');
    } catch (error) {
      this.logger.error(
        `Failed to bootstrap currencies: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  private async ensureDefaultCurrenciesAndRate() {
    const usd = await this.prisma.currency.upsert({
      where: { code: 'USD' },
      create: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        isBase: true,
        isActive: true,
        decimalPlaces: 2,
        position: 'prefix',
      },
      update: {},
    });

    await this.prisma.currency.updateMany({
      where: { isBase: true, id: { not: usd.id } },
      data: { isBase: false },
    });

    if (!usd.isBase) {
      await this.prisma.currency.update({
        where: { id: usd.id },
        data: { isBase: true },
      });
    }

    const mmk = await this.prisma.currency.upsert({
      where: { code: 'MMK' },
      create: {
        code: 'MMK',
        name: 'Myanmar Kyat',
        symbol: 'K',
        isBase: false,
        isActive: true,
        decimalPlaces: 0,
        position: 'suffix',
      },
      update: { isBase: false },
    });

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
        rate: 3500,
        isManualOverride: false,
      },
      update: {},
    });
  }

  async findAllCurrencies() {
    return this.currenciesRepo.findAll();
  }

  async findCurrencyById(id: string) {
    const currency = await this.currenciesRepo.findById(id);
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
    return currency;
  }

  async createCurrency(data: {
    code: string;
    name: string;
    symbol: string;
    isBase?: boolean;
    isActive?: boolean;
    decimalPlaces?: number;
    position?: string;
  }) {
    const payload = {
      code: data.code.toUpperCase(),
      name: data.name,
      symbol: data.symbol,
      isBase: data.isBase ?? false,
      isActive: data.isActive ?? true,
      decimalPlaces: data.decimalPlaces ?? 2,
      position: data.position ?? 'prefix',
    };

    if (payload.isBase) {
      return this.prisma.$transaction(async (tx) => {
        await tx.currency.updateMany({
          where: { isBase: true },
          data: { isBase: false },
        });
        return tx.currency.create({ data: { ...payload, isBase: true } });
      });
    }

    return this.currenciesRepo.create(payload);
  }

  async updateCurrency(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      symbol: string;
      isBase: boolean;
      isActive: boolean;
      decimalPlaces: number;
      position: string;
    }>,
  ) {
    await this.findCurrencyById(id);

    if (data.isBase === true) {
      await this.currenciesRepo.clearBase();
    }

    const updatePayload = { ...data };
    if (updatePayload.code) {
      updatePayload.code = updatePayload.code.toUpperCase();
    }

    return this.currenciesRepo.update(id, updatePayload);
  }

  async deleteCurrency(id: string) {
    await this.findCurrencyById(id);
    return this.currenciesRepo.delete(id);
  }

  async setBaseCurrency(id: string) {
    if (!id?.trim()) {
      throw new BadRequestException('Currency id is required to set base currency');
    }
    await this.findCurrencyById(id);
    return this.currenciesRepo.setBase(id);
  }

  async findAllExchangeRates() {
    return this.exchangeRatesRepo.findAll();
  }

  async findExchangeRateById(id: string) {
    const rate = await this.exchangeRatesRepo.findById(id);
    if (!rate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
    return rate;
  }

  async createExchangeRate(data: {
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    effectiveDate?: string;
  }) {
    await this.findCurrencyById(data.fromCurrencyId);
    await this.findCurrencyById(data.toCurrencyId);
    return this.exchangeRatesRepo.create(data);
  }

  async updateExchangeRate(id: string, rate: number) {
    const updated = await this.exchangeRatesRepo.update(id, rate, {
      isManualOverride: true,
    });
    return updated;
  }

  async deleteExchangeRate(id: string) {
    await this.findExchangeRateById(id);
    return this.exchangeRatesRepo.delete(id);
  }
}
