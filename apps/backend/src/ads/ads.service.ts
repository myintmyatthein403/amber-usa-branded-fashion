import { Injectable, NotFoundException } from '@nestjs/common';
import { AdPlacement } from '@prisma/client';
import { AdsRepository } from './ads.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class AdsService {
  constructor(private readonly adsRepository: AdsRepository) {}

  async findAll() {
    return this.adsRepository.findAll();
  }

  async findActive(placement?: AdPlacement) {
    return this.adsRepository.findActive(placement);
  }

  async findOne(id: string) {
    const ad = await this.adsRepository.findById(id);
    if (!ad) throw new NotFoundException(`Ad with ID ${id} not found`);
    return ad;
  }

  async create(data: any) {
    const sanitizedData = sanitizeData(data);
    return this.adsRepository.create(sanitizedData);
  }

  async update(id: string, data: any) {
    const ad = await this.adsRepository.findById(id);
    if (!ad) throw new NotFoundException(`Ad with ID ${id} not found`);
    
    const sanitizedData = sanitizeData(data);
    return this.adsRepository.update(id, sanitizedData);
  }

  async remove(id: string) {
    const ad = await this.adsRepository.findById(id);
    if (!ad) throw new NotFoundException(`Ad with ID ${id} not found`);
    
    return this.adsRepository.delete(id);
  }
}
