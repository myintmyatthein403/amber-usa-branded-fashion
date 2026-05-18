import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body() createSaleDto: Prisma.SaleCreateInput) {
    return this.salesService.createSale(createSaleDto as unknown as Parameters<typeof this.salesService.createSale>[0]);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.salesService.getAllSales({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get('active')
  findActive() {
    return this.salesService.getActiveSales();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.getSaleById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: Prisma.SaleUpdateInput,
  ) {
    return this.salesService.updateSale(id, updateSaleDto as unknown as Parameters<typeof this.salesService.updateSale>[1]);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.deleteSale(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post(':id/products/:productId')
  addProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.salesService.addProductToSale(id, productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete('products/:productId')
  removeProduct(@Param('productId') productId: string) {
    return this.salesService.removeProductFromSale(productId);
  }
}
