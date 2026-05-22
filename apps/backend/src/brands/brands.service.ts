import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getAllBrands(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PaginatedBrandsResult> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.brandsRepository.findMany(skip, limit, search),
      this.brandsRepository.count(search),
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
    const brand = await this.getBrandById(id);
    const productCount =
      (brand as Brand & { _count?: { products: number } })._count?.products ?? 0;
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete brand: ${productCount} product(s) are still assigned. Reassign them first.`,
      );
    }
    return this.brandsRepository.delete(id);
  }
}
