import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Collection, Prisma } from '@prisma/client';

@Injectable()
export class CollectionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CollectionCreateInput): Promise<Collection> {
    return this.prisma.collection.create({
      data,
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

  async findById(id: string): Promise<Collection | null> {
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

  async findBySlug(slug: string): Promise<Collection | null> {
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

  async update(id: string, data: Prisma.CollectionUpdateInput): Promise<Collection> {
    return this.prisma.collection.update({
      where: { id },
      data,
      include: {
        products: true,
      },
    });
  }

  async delete(id: string): Promise<Collection> {
    return this.prisma.collection.delete({
      where: { id },
    });
  }
}
