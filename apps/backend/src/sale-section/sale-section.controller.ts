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
} from '@nestjs/common';
import { SaleSectionService } from './sale-section.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SaleSectionSchema, type CreateSaleSectionInput } from '@amber/shared';

@Controller('sale-section')
export class SaleSectionController {
  constructor(private readonly saleSectionService: SaleSectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body(new ZodValidationPipe(SaleSectionSchema)) data: CreateSaleSectionInput) {
    return this.saleSectionService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return this.saleSectionService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }

  @Get('active')
  findActive() {
    return this.saleSectionService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SaleSectionSchema.partial())) data: Partial<CreateSaleSectionInput>,
  ) {
    return this.saleSectionService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.saleSectionService.remove(id);
  }
}
