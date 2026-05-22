import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GiftCard, Prisma } from '@prisma/client';

@Injectable()
export class GiftCardsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.GiftCardCreateInput): Promise<GiftCard> {
    return this.prisma.giftCard.create({
      data,
    });
  }

  async findAll(): Promise<GiftCard[]> {
    return this.prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<GiftCard | null> {
    return this.prisma.giftCard.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.GiftCardUpdateInput,
  ): Promise<GiftCard> {
    return this.prisma.giftCard.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<GiftCard> {
    return this.prisma.giftCard.delete({
      where: { id },
    });
  }
}
