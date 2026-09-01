import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateFeedbackSchema, type CreateFeedbackInput } from '@amber/shared';
import type { FeedbackStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Deliberately open to both logged-in and anonymous users — a beta user
  // hitting a bug is exactly the person who might also be logged out
  // because of that same bug, so this can't require auth.
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CreateFeedbackSchema)) data: CreateFeedbackInput,
  ) {
    return this.feedbackService.create(req.user?.userId, req.headers['user-agent'], data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Get()
  findAll(@Query('status') status?: FeedbackStatus) {
    return this.feedbackService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: FeedbackStatus) {
    return this.feedbackService.updateStatus(id, status);
  }
}
