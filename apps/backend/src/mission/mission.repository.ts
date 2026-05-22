import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionSection, Prisma } from '@prisma/client';

@Injectable()
export class MissionRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.MissionSectionCreateInput,
  ): Promise<MissionSection> {
    return this.prisma.missionSection.create({
      data,
    });
  }

  async findAll(): Promise<MissionSection[]> {
    return this.prisma.missionSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<MissionSection | null> {
    return this.prisma.missionSection.findFirst({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<MissionSection | null> {
    return this.prisma.missionSection.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.MissionSectionUpdateInput,
  ): Promise<MissionSection> {
    return this.prisma.missionSection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<MissionSection> {
    return this.prisma.missionSection.delete({
      where: { id },
    });
  }

  async deactivateAll(): Promise<void> {
    await this.prisma.missionSection.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  async deactivateOthers(id: string): Promise<void> {
    await this.prisma.missionSection.updateMany({
      where: {
        isActive: true,
        NOT: { id },
      },
      data: { isActive: false },
    });
  }
}
