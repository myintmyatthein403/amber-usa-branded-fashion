import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateProductPriceSchema, type CreateProductPriceInput } from '@amber/shared';

@Controller('product-prices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class ProductPricesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('productId') productId?: string, @Query('variantId') variantId?: string) {
    return this.prisma.productPrice.findMany({
      where: { productId, variantId },
      orderBy: { currencyCode: 'asc' },
    });
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateProductPriceSchema)) data: CreateProductPriceInput) {
    return this.prisma.productPrice.create({ data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.productPrice.delete({ where: { id } });
  }
}
