import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateCustomerReviewSchema, type CreateCustomerReviewInput, ReviewSchema } from '@amber/shared';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Admin-only manual/social-sourced review curation (see ReviewForm.tsx in
  // the admin app — this is NOT a customer-facing endpoint). Previously
  // this was fully anonymous and unvalidated, letting anyone POST an
  // arbitrary rating/userName/isVerifiedPurchase claim against any product
  // with no auth at all — the real customer path is POST /reviews/customer.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(ReviewSchema)) createReviewDto: unknown) {
    return this.reviewsService.createReview(
      createReviewDto as unknown as Parameters<
        typeof this.reviewsService.createReview
      >[0],
    );
  }

  // The real "Write a Review" path — gated to authenticated purchasers.
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('customer')
  createCustomerReview(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CreateCustomerReviewSchema)) data: CreateCustomerReviewInput,
  ) {
    return this.reviewsService.createCustomerReview(
      req.user!.userId,
      req.user!.email,
      data,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Get()
  findAll() {
    return this.reviewsService.getAllReviews();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getApprovedReviewsByProduct(productId);
  }

  // Lets the frontend decide whether to show "Write a Review" (and which
  // order item it maps to) without exposing the user's full order history.
  @UseGuards(JwtAuthGuard)
  @Get('eligibility/:productId')
  getEligibility(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    return this.reviewsService.getReviewEligibility(req.user!.userId, productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: Prisma.ReviewUpdateInput,
  ) {
    return this.reviewsService.updateReview(
      id,
      updateReviewDto as unknown as Parameters<
        typeof this.reviewsService.updateReview
      >[1],
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id/toggle-approval')
  toggleApproval(@Param('id') id: string) {
    return this.reviewsService.toggleApproval(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
