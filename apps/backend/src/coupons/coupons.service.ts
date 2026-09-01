import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';
import { Coupon } from '@prisma/client';
import { sanitizeData } from '../common/utils/data-sanitizer';

export interface CouponLineItem {
  productId: string;
  categoryId?: string | null;
  quantity: number;
  lineTotal: number;
}

export interface CouponComputation {
  coupon: Coupon;
  discountAmount: number;
  freeShipping: boolean;
}

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  // Validates a coupon code against the current cart and computes the
  // discount without mutating anything — safe to call repeatedly (e.g. from
  // a checkout-preview endpoint) before the order is actually created.
  // Redemption (usageCount increment + CouponRedemption row) only happens
  // inside OrdersRepository.create's transaction, via redeemCoupon below.
  async validateAndCompute(
    code: string,
    items: CouponLineItem[],
    orderTotal: number,
  ): Promise<CouponComputation> {
    const coupon = await this.couponsRepository.findByCode(code.trim().toUpperCase());
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (!coupon.isActive) throw new BadRequestException('This coupon is no longer active');
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (coupon.minOrderAmount != null && orderTotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Order must be at least ${coupon.minOrderAmount} to use this coupon`,
      );
    }

    let scopedItems = items;
    if (coupon.scopeType === 'PRODUCT') {
      scopedItems = items.filter((i) => i.productId === coupon.scopeProductId);
      if (scopedItems.length === 0) {
        throw new BadRequestException('This coupon does not apply to any items in your cart');
      }
    } else if (coupon.scopeType === 'CATEGORY') {
      scopedItems = items.filter((i) => i.categoryId === coupon.scopeCategoryId);
      if (scopedItems.length === 0) {
        throw new BadRequestException('This coupon does not apply to any items in your cart');
      }
    }

    const scopedTotal = scopedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    let discountAmount = 0;
    let freeShipping = false;

    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = scopedTotal * (Number(coupon.discountValue) / 100);
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Number(coupon.discountValue);
        break;
      case 'FREE_SHIPPING':
        freeShipping = true;
        break;
      case 'BUY_X_GET_Y': {
        const buyQty = coupon.buyQuantity ?? 1;
        const getQty = coupon.getQuantity ?? 1;
        const totalScopedQty = scopedItems.reduce((sum, i) => sum + i.quantity, 0);
        const avgUnitPrice = totalScopedQty > 0 ? scopedTotal / totalScopedQty : 0;
        const cycles = Math.floor(totalScopedQty / (buyQty + getQty));
        const freeUnits = cycles * getQty;
        // discountValue is the % off the "get" units — 100 means fully free.
        discountAmount = freeUnits * avgUnitPrice * (Number(coupon.discountValue) / 100);
        break;
      }
    }

    if (coupon.maxDiscount != null) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    }
    // Never discount more than the order itself.
    discountAmount = Math.min(discountAmount, orderTotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return { coupon, discountAmount, freeShipping };
  }

  async redeemCoupon(
    tx: Parameters<CouponsRepository['redeem']>[0],
    coupon: Coupon,
    orderId: string,
    userId?: string,
  ) {
    return this.couponsRepository.redeem(tx, coupon, orderId, userId);
  }

  async create(data: any): Promise<Coupon> {
    const sanitizedData = sanitizeData(data);
    return this.couponsRepository.create(sanitizedData);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponsRepository.findAll();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);
    return coupon;
  }

  async update(id: string, data: any): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);

    const sanitizedData = sanitizeData(data);
    return this.couponsRepository.update(id, sanitizedData);
  }

  async remove(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);

    return this.couponsRepository.delete(id);
  }
}
