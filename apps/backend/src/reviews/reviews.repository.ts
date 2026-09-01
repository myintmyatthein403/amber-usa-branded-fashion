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

  async findUserName(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return user?.name ?? null;
  }

  // Finds the most recent completed, not-yet-reviewed purchase of this
  // product by this user, so the frontend can offer "Write a Review"
  // pre-linked to the right order item instead of asking the customer to
  // pick one.
  async findReviewableOrderItem(userId: string, productId: string) {
    return this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: 'COMPLETED' },
        reviews: { none: { userId } },
      },
      orderBy: { id: 'desc' },
      select: { id: true },
    });
  }

  async findOrderItemForVerification(orderItemId: string) {
    return this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: { select: { userId: true, status: true } } },
    });
  }

  async findByUserAndOrderItem(userId: string, orderItemId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({ where: { userId, orderItemId } });
  }

  // Denormalized Product.avgRating/reviewCount, recomputed from approved
  // reviews only (unapproved reviews never affect the public aggregate) —
  // same "recompute the cached total from source rows" shape as
  // recomputeAndSyncStock in the logistics module.
  async recomputeProductRating(productId: string): Promise<void> {
    const agg = await this.prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });
  }
}
