import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrandsRepository } from './brands.repository';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private brandsRepository: BrandsRepository
  ) {}

  async createBrand(data: any): Promise<Brand> {
    const sanitizedData = this.prisma.sanitizeData(data);
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
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.brandsRepository.update(id, sanitizedData);
  }

  async deleteBrand(id: string): Promise<Brand> {
    await this.getBrandById(id);
    return this.brandsRepository.delete(id);
  }
}

