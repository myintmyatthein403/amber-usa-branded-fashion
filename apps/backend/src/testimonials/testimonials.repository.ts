import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Testimonial, Prisma } from '@prisma/client';

@Injectable()
export class TestimonialsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TestimonialCreateInput): Promise<Testimonial> {
    return this.prisma.testimonial.create({
      data,
    });
  }

  async findAll(): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Testimonial | null> {
    return this.prisma.testimonial.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.TestimonialUpdateInput,
  ): Promise<Testimonial> {
    return this.prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Testimonial> {
    return this.prisma.testimonial.delete({
      where: { id },
    });
  }
}
