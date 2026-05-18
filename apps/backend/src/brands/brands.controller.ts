import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BrandSchema } from '@amber/shared';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

interface PaginationQuery {
  page?: number;
  limit?: number;
}

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(BrandSchema)) createBrandDto: CreateBrandDto) {
    return this.brandsService.createBrand(createBrandDto);
  }

  @Get()
  findAll(@Query() query: PaginationQuery) {
    const page = query.page ? Math.max(1, parseInt(String(query.page), 10)) : 1;
    const limit = query.limit ? Math.max(1, Math.min(100, parseInt(String(query.limit), 10))) : 10;
    return this.brandsService.getAllBrands(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.getBrandById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BrandSchema.partial())) updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.updateBrand(id, updateBrandDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.deleteBrand(id);
  }
}
