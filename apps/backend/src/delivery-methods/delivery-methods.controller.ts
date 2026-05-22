import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeliveryMethodsService } from './delivery-methods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('delivery-methods')
export class DeliveryMethodsController {
  constructor(
    private readonly deliveryMethodsService: DeliveryMethodsService,
  ) {}

  @Get()
  findAll() {
    return this.deliveryMethodsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.deliveryMethodsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryMethodsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body() data: any) {
    return this.deliveryMethodsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.deliveryMethodsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryMethodsService.remove(id);
  }
}
