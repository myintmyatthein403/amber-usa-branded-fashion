import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.currency.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.currency.findUnique({
      where: { code },
    });
  }

  async findBase() {
    return this.prisma.currency.findFirst({
      where: { isBase: true },
    });
  }

  async create(data: {
    code: string;
    name: string;
    symbol: string;
    isBase?: boolean;
    isActive?: boolean;
    decimalPlaces?: number;
    position?: string;
  }) {
    return this.prisma.currency.create({ data });
  }

  async update(id: string, data: Partial<{
    code: string;
    name: string;
    symbol: string;
    isBase: boolean;
    isActive: boolean;
    decimalPlaces: number;
    position: string;
  }>) {
    return this.prisma.currency.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.currency.delete({ where: { id } });
  }

  async clearBase() {
    return this.prisma.currency.updateMany({
      where: { isBase: true },
      data: { isBase: false },
    });
  }

  async setBase(id: string) {
    await this.prisma.$transaction([
      this.prisma.currency.updateMany({
        where: { isBase: true },
        data: { isBase: false },
      }),
      this.prisma.currency.update({
        where: { id },
        data: { isBase: true },
      }),
    ]);
  }
}