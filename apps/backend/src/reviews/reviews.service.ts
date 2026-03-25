import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({
      data,
    });
  }

  async getAllReviews(): Promise<Review[]> {
    return this.prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApprovedReviewsByProduct(productId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReview(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async deleteReview(id: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async toggleApproval(id: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error('Review not found');
    
    return this.prisma.review.update({
      where: { id },
      data: { isApproved: !review.isApproved },
    });
  }
}
