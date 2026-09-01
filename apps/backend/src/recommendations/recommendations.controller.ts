import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateRecommendationSchema, type CreateRecommendationInput } from '@amber/shared';

@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class RecommendationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('productId') productId: string) {
    return this.prisma.productRecommendation.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
      include: { recommendedProduct: { select: { id: true, name: true, images: true } } },
    });
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateRecommendationSchema)) data: CreateRecommendationInput) {
    return this.prisma.productRecommendation.create({ data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.productRecommendation.delete({ where: { id } });
  }
}
