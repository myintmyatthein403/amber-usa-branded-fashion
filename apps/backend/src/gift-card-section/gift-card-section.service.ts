import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GiftCardSectionService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (data.isActive) {
      await this.prisma.giftCardSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.giftCardSection.create({ data });
  }

  async findAll() {
    return this.prisma.giftCardSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.giftCardSection.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, data: any) {
    if (data.isActive) {
      await this.prisma.giftCardSection.updateMany({
        where: {
          isActive: true,
          NOT: { id },
        },
        data: { isActive: false },
      });
    }
    return this.prisma.giftCardSection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.giftCardSection.delete({
      where: { id },
    });
  }
}
