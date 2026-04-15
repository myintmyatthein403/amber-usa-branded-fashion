import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: Prisma.CategoryCreateInput) {
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.prisma.category.create({ data: sanitizedData });
  }

  async getAllCategories() {
    return this.prisma.category.findMany();
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
