import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Coupon, Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return this.prisma.coupon.create({
      data,
    });
  }

  async findAll(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Coupon | null> {
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

  async remove(id: string): Promise<Coupon> {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
