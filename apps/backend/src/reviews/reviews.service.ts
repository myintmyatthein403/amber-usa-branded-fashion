import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Review, Prisma } from '@prisma/client';
import { ReviewsRepository } from './reviews.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';
import type { CreateCustomerReviewInput } from '@amber/shared';

type ReviewInput = Prisma.ReviewCreateInput;
type ReviewUpdateInput = Prisma.ReviewUpdateInput;

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async createReview(data: ReviewInput): Promise<Review> {
    const sanitizedData = sanitizeData(data);
    return this.reviewsRepository.create({
      ...sanitizedData,
      isApproved: false,
    });
  }

  // Real customer submission, gated to a purchase: orderItemId must belong
  // to a COMPLETED order owned by userId, and match productId. Still starts
  // unapproved — admin moderation is unchanged, this only changes who can
  // create the review and whether it's marked verified.
  async createCustomerReview(userId: string, fallbackName: string, data: CreateCustomerReviewInput): Promise<Review> {
    const userName = (await this.reviewsRepository.findUserName(userId)) || fallbackName;
    const orderItem = await this.reviewsRepository.findOrderItemForVerification(data.orderItemId);
    if (!orderItem) throw new NotFoundException('Order item not found');
    if (orderItem.order.userId !== userId) {
      throw new ForbiddenException('You can only review products you purchased');
    }
    if (orderItem.productId !== data.productId) {
      throw new BadRequestException('Order item does not match the product being reviewed');
    }
    if (orderItem.order.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review items from completed orders');
    }

    const existing = await this.reviewsRepository.findByUserAndOrderItem(userId, data.orderItemId);
    if (existing) {
      throw new BadRequestException('You have already reviewed this purchase');
    }

    return this.reviewsRepository.create({
      product: { connect: { id: data.productId } },
      user: { connect: { id: userId } },
      orderItem: { connect: { id: data.orderItemId } },
      userName,
      rating: data.rating,
      comment: data.comment,
      isVerifiedPurchase: true,
      isApproved: false,
    });
  }

  async getReviewEligibility(userId: string, productId: string) {
    const orderItem = await this.reviewsRepository.findReviewableOrderItem(userId, productId);
    return { eligible: !!orderItem, orderItemId: orderItem?.id };
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviewsRepository.findAll();
  }

  async getApprovedReviewsByProduct(productId: string): Promise<Review[]> {
    return this.reviewsRepository.findApprovedByProduct(productId);
  }

  async updateReview(id: string, data: ReviewUpdateInput): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    const updated = await this.reviewsRepository.update(id, sanitizedData);
    await this.reviewsRepository.recomputeProductRating(updated.productId);
    return updated;
  }

  async deleteReview(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    const deleted = await this.reviewsRepository.delete(id);
    await this.reviewsRepository.recomputeProductRating(review.productId);
    return deleted;
  }

  async toggleApproval(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    const updated = await this.reviewsRepository.update(id, {
      isApproved: !review.isApproved,
    });
    await this.reviewsRepository.recomputeProductRating(updated.productId);
    return updated;
  }
}
