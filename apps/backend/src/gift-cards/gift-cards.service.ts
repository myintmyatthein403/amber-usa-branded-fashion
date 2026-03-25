import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GiftCard, Prisma } from '@prisma/client';

@Injectable()
export class GiftCardsService {
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

  async findOne(id: string): Promise<GiftCard | null> {
    return this.prisma.giftCard.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.GiftCardUpdateInput): Promise<GiftCard> {
    return this.prisma.giftCard.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<GiftCard> {
    return this.prisma.giftCard.delete({
      where: { id },
    });
  }
}
