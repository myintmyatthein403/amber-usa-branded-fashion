import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Permissions } from '../auth/permissions.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ProductSchema, Permission } from '@amber/shared';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, StockValidationItemDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Post()
  @UsePipes(new ZodValidationPipe(ProductSchema))
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_READ)
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.getAllProducts({
      isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined,
      isNewArrival: query.isNewArrival !== undefined ? query.isNewArrival === 'true' : undefined,
      isBestSeller: query.isBestSeller !== undefined ? query.isBestSeller === 'true' : undefined,
      onSale: query.onSale !== undefined ? query.onSale === 'true' : undefined,
      categoryId: query.categoryId,
      brandId: query.brandId,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      search: query.search,
    });
  }

  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post('validate-stock')
  validateStock(@Body() items: StockValidationItemDto[]) {
    return this.productsService.validateStock(items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateProductDto))
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
