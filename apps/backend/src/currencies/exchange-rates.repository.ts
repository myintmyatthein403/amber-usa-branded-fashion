import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExchangeRatesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.exchangeRate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.exchangeRate.findUnique({
      where: { id },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });
  }

  async findByCurrencyPair(fromCurrencyId: string, toCurrencyId: string) {
    return this.prisma.exchangeRate.findUnique({
      where: {
        fromCurrencyId_toCurrencyId: {
          fromCurrencyId,
          toCurrencyId,
        },
      },
    });
  }

  async create(data: {
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    effectiveDate?: string;
  }) {
    return this.prisma.exchangeRate.create({
      data: {
        fromCurrencyId: data.fromCurrencyId,
        toCurrencyId: data.toCurrencyId,
        rate: data.rate,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
      },
    });
  }

  async update(
    id: string,
    rate: number,
    extra?: { isManualOverride?: boolean },
  ) {
    return this.prisma.exchangeRate.update({
      where: { id },
      data: {
        rate,
        ...(extra?.isManualOverride !== undefined && {
          isManualOverride: extra.isManualOverride,
        }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.exchangeRate.delete({ where: { id } });
  }
}