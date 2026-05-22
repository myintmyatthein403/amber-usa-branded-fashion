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
  Req,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Permissions } from '../auth/permissions.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ProductSchema, Permission } from '@amber/shared';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  StockValidationItemDto,
} from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Post()
  create(
    @Body(new ZodValidationPipe(ProductSchema))
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  async findAll(@Query() query: ProductQueryDto, @Req() req: { user?: { roleName?: string } }) {
    const isAdmin = req.user && ['ADMIN', 'SUPERADMIN'].includes(req.user.roleName ?? '');
    let attributeFilters: Record<string, string> | undefined;
    if (query.attributeFilters) {
      try {
        attributeFilters = JSON.parse(query.attributeFilters);
      } catch {
        attributeFilters = undefined;
      }
    }

    return this.productsService.getAllProducts({
      isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined,
      isNewArrival: query.isNewArrival !== undefined ? query.isNewArrival === 'true' : undefined,
      isBestSeller: query.isBestSeller !== undefined ? query.isBestSeller === 'true' : undefined,
      onSale: query.onSale !== undefined ? query.onSale === 'true' : undefined,
      categoryId: query.categoryId,
      brandId: query.brandId,
      currencyCode: query.currencyCode,
      market: query.market as 'US' | 'MM' | undefined,
      warehouseLocation: query.warehouseLocation as 'USA' | 'MYANMAR' | undefined,
      inStock: query.inStock !== undefined ? query.inStock === 'true' : undefined,
      priceMin: query.priceMin ? parseFloat(query.priceMin) : undefined,
      priceMax: query.priceMax ? parseFloat(query.priceMax) : undefined,
      status: isAdmin && query.status ? (query.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') : undefined,
      attributeFilters,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      search: query.search,
      publicOnly: !isAdmin,
    });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_READ)
  @Header('Content-Type', 'text/csv')
  async exportProducts(@Res() res: Response) {
    const products = await this.productsService.getAllProducts({ limit: 10000 });
    const rows = ['sku,productName,variantSize,variantColor,price,currencyCode,stock,warehouseLocation,buyPrice'];
    const data = Array.isArray(products) ? products : products.data;
    for (const p of data) {
      for (const v of (p as { variants?: Array<Record<string, unknown>> }).variants ?? []) {
        const inv = (v as { inventory?: Array<{ warehouse?: { location?: string }; quantity?: number }> }).inventory ?? [];
        const loc = inv.map((i) => `${i.warehouse?.location}:${i.quantity}`).join('|') || '';
        rows.push(
          `${v.sku},"${p.name}",${v.size},${v.color},${v.price ?? p.price},${(v as { currencyCode?: string }).currencyCode ?? (p as { currencyCode?: string }).currencyCode},${v.stock},${loc},${(v as { buyPrice?: string }).buyPrice ?? ''}`,
        );
      }
    }
    res.send(rows.join('\n'));
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  async importProducts(
    @Body() body: { rows: Array<Record<string, string>>; dryRun?: boolean },
  ) {
    const errors: string[] = [];
    const preview: Array<Record<string, string>> = [];
    for (const row of body.rows ?? []) {
      if (!row.sku || !row.productName) {
        errors.push(`Missing sku or productName: ${JSON.stringify(row)}`);
        continue;
      }
      preview.push(row);
    }
    if (body.dryRun || errors.length) {
      return { dryRun: true, preview, errors };
    }
    return { imported: preview.length, preview };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user?: { roleName?: string } }) {
    const isAdmin = req.user && ['ADMIN', 'SUPERADMIN'].includes(req.user.roleName ?? '');
    return this.productsService.getProductById(id, !isAdmin);
  }

  @Post('validate-stock')
  validateStock(@Body() items: StockValidationItemDto[]) {
    return this.productsService.validateStock(items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductDto))
    updateProductDto: UpdateProductDto,
    @Query('draft') draft?: string,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, draft === 'true');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions(Permission.PRODUCTS_WRITE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
