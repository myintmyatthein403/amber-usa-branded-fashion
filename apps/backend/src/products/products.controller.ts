import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('products:write')
  @Post()
  create(@Body() createProductDto: Prisma.ProductCreateInput) {
    return this.productsService.createProduct(createProductDto);
  }

  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @Permissions('products:read')
  @Get()
  async findAll(
    @Query('isFeatured') isFeatured?: string,
    @Query('isNewArrival') isNewArrival?: string,
    @Query('isBestSeller') isBestSeller?: string,
    @Query('onSale') onSale?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.getAllProducts({
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      isNewArrival: isNewArrival !== undefined ? isNewArrival === 'true' : undefined,
      isBestSeller: isBestSeller !== undefined ? isBestSeller === 'true' : undefined,
      onSale: onSale !== undefined ? onSale === 'true' : undefined,
      categoryId,
      brandId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @Permissions('products:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post('validate-stock')
  validateStock(@Body() items: Array<{ productId: string; variantId?: string; quantity: number }>) {
    return this.productsService.validateStock(items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('products:write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Prisma.ProductUpdateInput) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('products:write')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
