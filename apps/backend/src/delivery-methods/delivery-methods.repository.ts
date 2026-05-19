import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryMethod, Prisma } from '@prisma/client';

@Injectable()
export class DeliveryMethodsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<DeliveryMethod[]> {
    return this.prisma.deliveryMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<DeliveryMethod[]> {
    return this.prisma.deliveryMethod.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async findById(id: string): Promise<DeliveryMethod | null> {
    return this.prisma.deliveryMethod.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.DeliveryMethodCreateInput,
  ): Promise<DeliveryMethod> {
    return this.prisma.deliveryMethod.create({ data });
  }

  async update(
    id: string,
    data: Prisma.DeliveryMethodUpdateInput,
  ): Promise<DeliveryMethod> {
    return this.prisma.deliveryMethod.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<DeliveryMethod> {
    return this.prisma.deliveryMethod.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.DeliveryMethodWhereInput): Promise<number> {
    return this.prisma.deliveryMethod.count({ where });
  }
}
