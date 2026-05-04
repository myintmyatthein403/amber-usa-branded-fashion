import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FooterSectionService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (data.isActive) {
      await this.prisma.footerSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.footerSection.create({ data });
  }

  async findAll() {
    return this.prisma.footerSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.footerSection.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, data: any) {
    if (data.isActive) {
      await this.prisma.footerSection.updateMany({
        where: {
          isActive: true,
          NOT: { id },
        },
        data: { isActive: false },
      });
    }
    return this.prisma.footerSection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.footerSection.delete({
      where: { id },
    });
  }
}
