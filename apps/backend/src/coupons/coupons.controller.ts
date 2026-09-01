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
import { Throttle } from '@nestjs/throttler';
import { CouponsService } from './coupons.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CouponSchema, CouponObjectSchema, ApplyCouponSchema, type ApplyCouponInput } from '@amber/shared';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // Public checkout-preview validation — lets the storefront show the
  // discount before the order is actually placed, without redeeming
  // anything (usageCount is only incremented inside order creation).
  // Tightened off the 120/min global default — otherwise this is a fast
  // coupon-code enumeration oracle.
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('validate')
  async validate(
    @Body(new ZodValidationPipe(ApplyCouponSchema)) data: ApplyCouponInput,
  ) {
    const { coupon, discountAmount, freeShipping } =
      await this.couponsService.validateAndCompute(data.code, data.items, data.orderTotal);
    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount,
      freeShipping,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(CouponSchema)) data: any) {
    return this.couponsService.create(data);
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CouponObjectSchema.partial())) data: any,
  ) {
    return this.couponsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
