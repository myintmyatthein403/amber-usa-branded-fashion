import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FooterSection, Prisma } from '@prisma/client';

@Injectable()
export class FooterSectionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FooterSectionCreateInput): Promise<FooterSection> {
    if (data.isActive) {
      await this.prisma.footerSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.footerSection.create({ data });
  }

  async findAll(): Promise<FooterSection[]> {
    return this.prisma.footerSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<FooterSection | null> {
    return this.prisma.footerSection.findFirst({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<FooterSection | null> {
    return this.prisma.footerSection.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.FooterSectionUpdateInput,
  ): Promise<FooterSection> {
    if (data.isActive) {
      await this.prisma.footerSection.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }
    return this.prisma.footerSection.update({ where: { id }, data });
  }

  async delete(id: string): Promise<FooterSection> {
    return this.prisma.footerSection.delete({ where: { id } });
  }

  async count(where?: Prisma.FooterSectionWhereInput): Promise<number> {
    return this.prisma.footerSection.count({ where });
  }
}
