import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Patch,
  UsePipes,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CategorySchema } from '@amber/shared';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

interface PaginationQuery {
  page?: number;
  limit?: number;
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: PaginationQuery) {
    const page = query.page ? Math.max(1, parseInt(String(query.page), 10)) : 1;
    const limit = query.limit
      ? Math.max(1, Math.min(100, parseInt(String(query.limit), 10)))
      : 10;
    return this.categoriesService.getAllCategories(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CategorySchema))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CategorySchema.partial()))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
