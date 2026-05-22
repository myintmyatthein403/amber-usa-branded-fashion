import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  async findAll(): Promise<Review[]> {
    return this.prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findApprovedByProduct(productId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
