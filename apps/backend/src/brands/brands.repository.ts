import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand, Prisma } from '@prisma/client';

@Injectable()
export class BrandsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  async findAll(): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findMany(skip: number, take: number): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.brand.count();
  }

  async findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Brand> {
    return this.prisma.brand.delete({ where: { id } });
  }
}
