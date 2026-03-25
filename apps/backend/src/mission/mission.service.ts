import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MissionService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (data.isActive) {
      await this.prisma.missionSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.missionSection.create({ data });
  }

  async findAll() {
    return this.prisma.missionSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.missionSection.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, data: any) {
    if (data.isActive) {
      await this.prisma.missionSection.updateMany({
        where: { 
          isActive: true,
          NOT: { id }
        },
        data: { isActive: false },
      });
    }
    return this.prisma.missionSection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.missionSection.delete({
      where: { id },
    });
  }
}
