import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PriceTiersService } from './price-tiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreatePriceTierSchema, type CreatePriceTierInput } from '@amber/shared';

@Controller('price-tiers')
export class PriceTiersController {
  constructor(private readonly priceTiersService: PriceTiersService) {}

  @Get()
  list(@Query('productId') productId?: string, @Query('variantId') variantId?: string) {
    return this.priceTiersService.list(productId, variantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(CreatePriceTierSchema)) data: CreatePriceTierInput) {
    return this.priceTiersService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceTiersService.remove(id);
  }
}
