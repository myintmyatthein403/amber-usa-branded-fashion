import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroSection } from '@prisma/client';
import { HeroRepository } from './hero.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { HeroSection as HeroSectionInput } from '@amber/shared';

@Injectable()
export class HeroService {
  constructor(private readonly heroRepository: HeroRepository) {}

  async create(data: HeroSectionInput): Promise<HeroSection> {
    const sanitizedData = sanitizeData(data);
    if (sanitizedData.isActive) {
      await this.heroRepository.deactivateAll();
    }
    return this.heroRepository.create(sanitizedData);
  }

  async findAll(): Promise<HeroSection[]> {
    return this.heroRepository.findAll();
  }

  async findActive(): Promise<HeroSection | null> {
    return this.heroRepository.findActive();
  }

  async findOne(id: string): Promise<HeroSection> {
    const hero = await this.heroRepository.findById(id);
    if (!hero) {
      throw new NotFoundException(`Hero section with ID ${id} not found`);
    }
    return hero;
  }

  async update(id: string, data: HeroSectionInput): Promise<HeroSection> {
    await this.findOne(id);
    const sanitizedData = sanitizeData(data);
    if (sanitizedData.isActive) {
      await this.heroRepository.deactivateOthers(id);
    }
    return this.heroRepository.update(id, sanitizedData);
  }

  async remove(id: string): Promise<HeroSection> {
    await this.findOne(id);
    return this.heroRepository.delete(id);
  }
}
