import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (data.isActive) {
      await this.prisma.heroSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.heroSection.create({ data });
  }

  async findAll() {
    return this.prisma.heroSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.heroSection.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, data: any) {
    if (data.isActive) {
      await this.prisma.heroSection.updateMany({
        where: { 
          isActive: true,
          NOT: { id }
        },
        data: { isActive: false },
      });
    }
    return this.prisma.heroSection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.heroSection.delete({
      where: { id },
    });
  }
}
