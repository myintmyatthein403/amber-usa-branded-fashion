import { Injectable, NotFoundException } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';
import { Coupon } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async create(data: any): Promise<Coupon> {
    const sanitizedData = sanitizeData(data);
    return this.couponsRepository.create(sanitizedData);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponsRepository.findAll();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);
    return coupon;
  }

  async update(id: string, data: any): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    return this.couponsRepository.update(id, sanitizedData);
  }

  async remove(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);

    return this.couponsRepository.delete(id);
  }
}
