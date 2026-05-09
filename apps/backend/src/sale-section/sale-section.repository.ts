import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaleSection, Prisma } from '@prisma/client';

@Injectable()
export class SaleSectionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SaleSectionCreateInput): Promise<SaleSection> {
    if (data.isActive) {
      await this.prisma.saleSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.saleSection.create({ data });
  }

  async findAll(): Promise<SaleSection[]> {
    return this.prisma.saleSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<SaleSection | null> {
    return this.prisma.saleSection.findFirst({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<SaleSection | null> {
    return this.prisma.saleSection.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.SaleSectionUpdateInput): Promise<SaleSection> {
    if (data.isActive) {
      await this.prisma.saleSection.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }
    return this.prisma.saleSection.update({ where: { id }, data });
  }

  async delete(id: string): Promise<SaleSection> {
    return this.prisma.saleSection.delete({ where: { id } });
  }

  async count(where?: Prisma.SaleSectionWhereInput): Promise<number> {
    return this.prisma.saleSection.count({ where });
  }
}