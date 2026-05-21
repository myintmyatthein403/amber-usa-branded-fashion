import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand, Prisma } from '@prisma/client';

const brandInclude = {
  _count: { select: { products: true } },
} as const;

@Injectable()
export class BrandsRepository {
  constructor(private prisma: PrismaService) {}

  private buildWhere(search?: string): Prisma.BrandWhereInput {
    if (!search?.trim()) return {};
    const term = search.trim();
    return {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { note: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  async findAll(): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: brandInclude,
    });
  }

  async findMany(
    skip: number,
    take: number,
    search?: string,
  ): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      where: this.buildWhere(search),
      skip,
      take,
      orderBy: { name: 'asc' },
      include: brandInclude,
    });
  }

  async count(search?: string): Promise<number> {
    return this.prisma.brand.count({ where: this.buildWhere(search) });
  }

  async findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: { id },
      include: brandInclude,
    });
  }

  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({
      where: { id },
      data,
      include: brandInclude,
    });
  }

  async delete(id: string): Promise<Brand> {
    return this.prisma.brand.delete({ where: { id } });
  }
}
