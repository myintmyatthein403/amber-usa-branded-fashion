import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(
    userId: string,
    data: {
      label?: string;
      country: string;
      street: string;
      city: string;
      state?: string;
      township?: string;
      zipCode?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.savedAddress.create({
      data: { userId, ...data },
    });
  }

  async update(userId: string, id: string, data: Partial<{
    label: string;
    country: string;
    street: string;
    city: string;
    state: string;
    township: string;
    zipCode: string;
    phone: string;
    isDefault: boolean;
  }>) {
    const existing = await this.prisma.savedAddress.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Address not found');
    if (data.isDefault) {
      await this.prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.savedAddress.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.savedAddress.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Address not found');
    return this.prisma.savedAddress.delete({ where: { id } });
  }
}
