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
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateQuestionSchema,
  type CreateQuestionInput,
  CreateAnswerSchema,
  type CreateAnswerInput,
} from '@amber/shared';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CreateQuestionSchema)) data: CreateQuestionInput,
  ) {
    return this.questionsService.createQuestion(req.user!.userId, req.user!.email, data);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.questionsService.getApprovedByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Get()
  findAll() {
    return this.questionsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id/toggle-approval')
  toggleApproval(@Param('id') id: string) {
    return this.questionsService.toggleApproval(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }

  // Only admins answer for now — keeps the section a reliable "ask the
  // store" channel rather than an open community thread.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post(':id/answers')
  addAnswer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateAnswerSchema)) data: CreateAnswerInput,
  ) {
    return this.questionsService.addAnswer(id, data, {
      answeredBy: req.user!.email,
      isOfficial: true,
    });
  }
}
