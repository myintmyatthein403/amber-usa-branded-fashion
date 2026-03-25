import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Collection, Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { productIds, ...rest } = data;
    return this.prisma.collection.create({
      data: {
        ...rest,
        products: {
          connect: productIds?.map((id: string) => ({ id })),
        },
      },
      include: {
        products: true,
      },
    });
  }

  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            brand: true,
            category: true,
          }
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            brand: true,
            category: true,
          }
        },
      },
    });
  }

  async update(id: string, data: any) {
    const { productIds, ...rest } = data;
    
    const updateData: Prisma.CollectionUpdateInput = { ...rest };

    if (productIds) {
      updateData.products = {
        set: productIds.map((pid: string) => ({ id: pid })),
      };
    }

    return this.prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.collection.delete({
      where: { id },
    });
  }
}
