import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!method) throw new NotFoundException(`Payment method ${id} not found`);
    return method;
  }

  async create(data: any) {
    return this.prisma.paymentMethod.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.paymentMethod.delete({ where: { id } });
  }
}
