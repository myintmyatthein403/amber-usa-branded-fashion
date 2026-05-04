import { Injectable, NotFoundException } from '@nestjs/common';
import { Review, Prisma } from '@prisma/client';
import { ReviewsRepository } from './reviews.repository';
import { sanitizeData } from '../common/utils/data-sanitizer';

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
    return this.reviewsRepository.update(
      id,
      sanitizedData,
    );
  }

  async deleteReview(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    return this.reviewsRepository.delete(id);
  }

  async toggleApproval(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

    return this.reviewsRepository.update(id, {
      isApproved: !review.isApproved,
    });
  }
}