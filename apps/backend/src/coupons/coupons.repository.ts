import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Coupon, Prisma } from '@prisma/client';

@Injectable()
export class CouponsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return this.prisma.coupon.create({
      data,
    });
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({ where: { code } });
  }

  // Atomically increments usageCount only if it hasn't already hit
  // usageLimit — the usageLimit value is passed in from the caller's
  // already-fetched coupon record rather than compared column-to-column
  // (Prisma's fluent API can't express that), same guarded-updateMany
  // pattern used everywhere else in this codebase for race-safe counters.
  async redeem(
    tx: Prisma.TransactionClient,
    coupon: Coupon,
    orderId: string,
    userId?: string,
  ): Promise<void> {
    const where: Prisma.CouponWhereInput = { id: coupon.id };
    if (coupon.usageLimit != null) {
      where.usageCount = { lt: coupon.usageLimit };
    }
    const updated = await tx.coupon.updateMany({
      where,
      data: { usageCount: { increment: 1 } },
    });
    if (updated.count === 0) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }
    await tx.couponRedemption.create({
      data: { couponId: coupon.id, orderId, userId },
    });
  }

  async findAll(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.CouponUpdateInput): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Coupon> {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
