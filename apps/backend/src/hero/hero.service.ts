import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroSection } from '@prisma/client';
import { HeroRepository } from './hero.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { HeroSection as HeroSectionInput } from '@amber/shared';
import { MemoryCacheService } from '../common/cache/memory-cache.service';

const CACHE_KEY = 'hero:active';
const CACHE_TTL_MS = 60_000;

@Injectable()
export class HeroService {
  constructor(
    private readonly heroRepository: HeroRepository,
    private cache: MemoryCacheService,
  ) {}

  async create(data: HeroSectionInput): Promise<HeroSection> {
    const sanitizedData = sanitizeData(data);
    if (sanitizedData.isActive) {
      await this.heroRepository.deactivateAll();
    }
    const created = await this.heroRepository.create(sanitizedData);
    this.cache.invalidate(CACHE_KEY);
    return created;
  }

  async findAll(): Promise<HeroSection[]> {
    return this.heroRepository.findAll();
  }

  async findActive(): Promise<HeroSection | null> {
    return this.cache.getOrSet(CACHE_KEY, CACHE_TTL_MS, () =>
      this.heroRepository.findActive(),
    );
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
    const updated = await this.heroRepository.update(id, sanitizedData);
    this.cache.invalidate(CACHE_KEY);
    return updated;
  }

  async remove(id: string): Promise<HeroSection> {
    await this.findOne(id);
    const deleted = await this.heroRepository.delete(id);
    this.cache.invalidate(CACHE_KEY);
    return deleted;
  }
}
