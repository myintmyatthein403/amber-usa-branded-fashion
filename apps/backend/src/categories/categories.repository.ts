import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';

const categoryInclude = {
  parent: true,
  subcategories: true,
  _count: { select: { products: true } },
} as const;

export interface CategoryReorderUpdate {
  id: string;
  parentId: string | null;
  displayOrder: number;
}

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: categoryInclude,
    });
  }

  async findMany(skip: number, take: number): Promise<Category[]> {
    return this.prisma.category.findMany({
      skip,
      take,
      orderBy: { displayOrder: 'asc' },
      include: categoryInclude,
    });
  }

  async count(): Promise<number> {
    return this.prisma.category.count();
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: categoryInclude,
    });
  }

  async reorderMany(updates: CategoryReorderUpdate[]): Promise<Category[]> {
    return this.prisma.$transaction(
      updates.map(({ id, parentId, displayOrder }) =>
        this.prisma.category.update({
          where: { id },
          data: { parentId, displayOrder },
          include: categoryInclude,
        }),
      ),
    );
  }

  async findWithChildren(parentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        OR: [
          { id: parentId },
          { parentId: parentId },
        ],
      },
      include: categoryInclude,
      orderBy: { displayOrder: 'asc' },
    });
  }
}
