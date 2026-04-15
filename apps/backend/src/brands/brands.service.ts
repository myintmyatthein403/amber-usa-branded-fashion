import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async createBrand(data: Prisma.BrandCreateInput): Promise<Brand> {
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.prisma.brand.create({
      data: sanitizedData,
    });
  }

  async getAllBrands(): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getBrandById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: { id },
    });
  }

  async updateBrand(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.prisma.brand.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async deleteBrand(id: string): Promise<Brand> {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
