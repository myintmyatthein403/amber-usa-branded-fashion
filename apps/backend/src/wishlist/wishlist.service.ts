import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { brand: true, variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string, variantId?: string) {
    const existing = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId, variantId: variantId ?? null },
    });
    if (existing) return existing;
    return this.prisma.wishlistItem.create({
      data: { userId, productId, variantId },
      include: { product: true },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    return this.prisma.wishlistItem.delete({ where: { id } });
  }
}
