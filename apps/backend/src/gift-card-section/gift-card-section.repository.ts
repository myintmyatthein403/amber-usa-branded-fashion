import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GiftCardSection, Prisma } from '@prisma/client';

@Injectable()
export class GiftCardSectionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.GiftCardSectionCreateInput): Promise<GiftCardSection> {
    if (data.isActive) {
      await this.prisma.giftCardSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.giftCardSection.create({ data });
  }

  async findAll(): Promise<GiftCardSection[]> {
    return this.prisma.giftCardSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<GiftCardSection | null> {
    return this.prisma.giftCardSection.findFirst({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<GiftCardSection | null> {
    return this.prisma.giftCardSection.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.GiftCardSectionUpdateInput): Promise<GiftCardSection> {
    if (data.isActive) {
      await this.prisma.giftCardSection.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }
    return this.prisma.giftCardSection.update({ where: { id }, data });
  }

  async delete(id: string): Promise<GiftCardSection> {
    return this.prisma.giftCardSection.delete({ where: { id } });
  }

  async count(where?: Prisma.GiftCardSectionWhereInput): Promise<number> {
    return this.prisma.giftCardSection.count({ where });
  }
}