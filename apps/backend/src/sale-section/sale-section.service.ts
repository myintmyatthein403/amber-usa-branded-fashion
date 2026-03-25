import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaleSectionService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (data.isActive) {
      await this.prisma.saleSection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return this.prisma.saleSection.create({ data });
  }

  async findAll() {
    return this.prisma.saleSection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.saleSection.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, data: any) {
    if (data.isActive) {
      await this.prisma.saleSection.updateMany({
        where: { 
          isActive: true,
          NOT: { id }
        },
        data: { isActive: false },
      });
    }
    return this.prisma.saleSection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.saleSection.delete({
      where: { id },
    });
  }
}
