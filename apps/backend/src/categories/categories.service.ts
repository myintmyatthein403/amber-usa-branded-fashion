import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

export interface PaginatedResult {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const sanitizedData = sanitizeData(data);
    return this.categoriesRepository.create(sanitizedData);
  }

  async getAllCategories(page: number = 1, limit: number = 10): Promise<PaginatedResult> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.categoriesRepository.findMany(skip, limit),
      this.categoriesRepository.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const sanitizedData = sanitizeData(data);
    return this.categoriesRepository.update(id, sanitizedData);
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.categoriesRepository.delete(id);
  }
}
