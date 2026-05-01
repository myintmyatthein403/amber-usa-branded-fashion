import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BrandSchema } from '@amber/shared';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(BrandSchema))
  create(@Body() createBrandDto: any) {
    return this.brandsService.createBrand(createBrandDto);
  }

  @Get()
  findAll() {
    return this.brandsService.getAllBrands();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.getBrandById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(BrandSchema.partial()))
  update(@Param('id') id: string, @Body() updateBrandDto: any) {
    return this.brandsService.updateBrand(id, updateBrandDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.deleteBrand(id);
  }
}
