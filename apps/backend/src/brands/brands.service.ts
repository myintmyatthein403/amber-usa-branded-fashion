import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { Brand } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class BrandsService {
  constructor(
    private brandsRepository: BrandsRepository
  ) {}

  async createBrand(data: any): Promise<Brand> {
    const sanitizedData = sanitizeData(data);
    return this.brandsRepository.create(sanitizedData);
  }

  async getAllBrands(): Promise<Brand[]> {
    return this.brandsRepository.findAll();
  }

  async getBrandById(id: string): Promise<Brand | null> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async updateBrand(id: string, data: any): Promise<Brand> {
    const sanitizedData = sanitizeData(data);
    return this.brandsRepository.update(id, sanitizedData);
  }

  async deleteBrand(id: string): Promise<Brand> {
    await this.getBrandById(id);
    return this.brandsRepository.delete(id);
  }
}

