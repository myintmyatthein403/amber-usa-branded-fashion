import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: Prisma.ReviewCreateInput) {
    return this.reviewsService.createReview(
      createReviewDto as unknown as Parameters<
        typeof this.reviewsService.createReview
      >[0],
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
