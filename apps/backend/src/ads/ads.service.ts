import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdPlacement, AdStatus } from '@prisma/client';

@Injectable()
export class AdsService {
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

  async findOne(id: string) {
    return this.prisma.ad.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.ad.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.ad.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.ad.delete({
      where: { id },
    });
  }
}
