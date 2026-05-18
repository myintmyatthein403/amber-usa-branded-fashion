import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { Brand } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

export interface PaginatedBrandsResult {
  data: Brand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BrandsService {
  constructor(private brandsRepository: BrandsRepository) {}

  async createBrand(data: CreateBrandDto): Promise<Brand> {
    const sanitizedData = sanitizeData(data);
    return this.brandsRepository.create(sanitizedData);
  }

  async getAllBrands(page: number = 1, limit: number = 10): Promise<PaginatedBrandsResult> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.brandsRepository.findMany(skip, limit),
      this.brandsRepository.count(),
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

  async getBrandById(id: string): Promise<Brand | null> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async updateBrand(id: string, data: UpdateBrandDto): Promise<Brand> {
    const sanitizedData = sanitizeData(data);
    return this.brandsRepository.update(id, sanitizedData);
  }

  async deleteBrand(id: string): Promise<Brand> {
    await this.getBrandById(id);
    return this.brandsRepository.delete(id);
  }
}
