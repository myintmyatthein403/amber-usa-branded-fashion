import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ad, AdPlacement, AdStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(placement?: AdPlacement) {
    const now = new Date();
    return this.prisma.ad.findMany({
      where: {
        status: AdStatus.ACTIVE,
        placement: placement,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
        ],
      },
      orderBy: { priority: 'desc' },
    });
  }

  async findById(id: string): Promise<Ad | null> {
    return this.prisma.ad.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.AdCreateInput): Promise<Ad> {
    return this.prisma.ad.create({
      data,
    });
  }

  async update(id: string, data: Prisma.AdUpdateInput): Promise<Ad> {
    return this.prisma.ad.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Ad> {
    return this.prisma.ad.delete({
      where: { id },
    });
  }
}
