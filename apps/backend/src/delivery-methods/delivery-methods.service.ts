import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deliveryMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.deliveryMethod.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.deliveryMethod.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.deliveryMethod.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.deliveryMethod.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.deliveryMethod.delete({
      where: { id },
    });
  }
}
