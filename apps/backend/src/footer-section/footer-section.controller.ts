import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FooterSectionService } from './footer-section.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { FooterSectionSchema, type CreateFooterSectionInput } from '@amber/shared';

@Controller('footer-section')
export class FooterSectionController {
  constructor(private readonly footerSectionService: FooterSectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body(new ZodValidationPipe(FooterSectionSchema)) data: CreateFooterSectionInput) {
    return this.footerSectionService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.footerSectionService.findAll();
  }

  @Get('active')
  findActive() {
    return this.footerSectionService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(FooterSectionSchema.partial())) data: Partial<CreateFooterSectionInput>,
  ) {
    return this.footerSectionService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.footerSectionService.remove(id);
  }
}
