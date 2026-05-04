import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HeroSection, Prisma } from '@prisma/client';

@Injectable()
export class HeroRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.HeroSectionCreateInput): Promise<HeroSection> {
    return this.prisma.heroSection.create({
      data,
    });
  }

  async findAll(): Promise<HeroSection[]> {
    return this.prisma.heroSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<HeroSection | null> {
    return this.prisma.heroSection.findFirst({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<HeroSection | null> {
    return this.prisma.heroSection.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.HeroSectionUpdateInput,
  ): Promise<HeroSection> {
    return this.prisma.heroSection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<HeroSection> {
    return this.prisma.heroSection.delete({
      where: { id },
    });
  }

  async deactivateAll(): Promise<void> {
    await this.prisma.heroSection.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  async deactivateOthers(id: string): Promise<void> {
    await this.prisma.heroSection.updateMany({
      where: {
        isActive: true,
        NOT: { id },
      },
      data: { isActive: false },
    });
  }
}
