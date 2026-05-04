import { Injectable, NotFoundException } from '@nestjs/common';
import { Testimonial } from '@prisma/client';
import { TestimonialsRepository } from './testimonials.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly testimonialsRepository: TestimonialsRepository,
  ) {}

  async create(data: any): Promise<Testimonial> {
    const sanitizedData = sanitizeData(data);
    return this.testimonialsRepository.create(sanitizedData);
  }

  async findAll(): Promise<Testimonial[]> {
    return this.testimonialsRepository.findAll();
  }

  async findActive(): Promise<Testimonial[]> {
    return this.testimonialsRepository.findActive();
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialsRepository.findById(id);
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async update(id: string, data: any): Promise<Testimonial> {
    await this.findOne(id);
    const sanitizedData = sanitizeData(data);
    return this.testimonialsRepository.update(id, sanitizedData);
  }

  async remove(id: string): Promise<Testimonial> {
    await this.findOne(id);
    return this.testimonialsRepository.delete(id);
  }
}
