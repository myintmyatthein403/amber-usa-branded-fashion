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
import { HeroService } from './hero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { HeroSectionSchema, type CreateHeroSectionInput } from '@amber/shared';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async create(@Body(new ZodValidationPipe(HeroSectionSchema)) data: CreateHeroSectionInput) {
    return this.heroService.create(
      data as unknown as Parameters<typeof this.heroService.create>[0],
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.heroService.findAll();
  }

  @Get('active')
  findActive() {
    return this.heroService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(HeroSectionSchema.partial())) data: Partial<CreateHeroSectionInput>,
  ) {
    return this.heroService.update(
      id,
      data as unknown as Parameters<typeof this.heroService.update>[1],
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
