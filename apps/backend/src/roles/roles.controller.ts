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
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RoleSchema } from '@amber/shared';
import type { z } from 'zod';

type RoleInput = z.infer<typeof RoleSchema>;

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(RoleSchema)) createDto: RoleInput) {
    return this.rolesService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RoleSchema.partial())) updateDto: Partial<RoleInput>,
  ) {
    return this.rolesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
