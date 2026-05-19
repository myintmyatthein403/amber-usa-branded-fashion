import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class PaymentMethodsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findActive(): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    return this.prisma.paymentMethod.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.PaymentMethodCreateInput): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.create({ data });
  }

  async update(
    id: string,
    data: Prisma.PaymentMethodUpdateInput,
  ): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.PaymentMethodWhereInput): Promise<number> {
    return this.prisma.paymentMethod.count({ where });
  }
}
