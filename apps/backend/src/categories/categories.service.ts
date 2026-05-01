import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class CategoriesService {
  constructor(
    private categoriesRepository: CategoriesRepository
  ) {}

  async createCategory(data: any): Promise<Category> {
    const sanitizedData = sanitizeData(data);
    return this.categoriesRepository.create(sanitizedData);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async updateCategory(id: string, data: any): Promise<Category> {
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
