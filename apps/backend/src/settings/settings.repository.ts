import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Settings, Prisma } from '@prisma/client';

@Injectable()
export class SettingsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Settings | null> {
    return this.prisma.settings.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.SettingsCreateInput): Promise<Settings> {
    return this.prisma.settings.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.SettingsUpdateInput,
  ): Promise<Settings> {
    return this.prisma.settings.update({
      where: { id },
      data,
    });
  }

  async findGlobal() {
    return this.prisma.settings.findUnique({
      where: { id: 'global' },
      select: {
        id: true,
        privacyPolicy: true,
        termsConditions: true,
        usdToMmkRate: true,
        stripePublishableKey: true,
        updatedAt: true,
      },
    });
  }
}
