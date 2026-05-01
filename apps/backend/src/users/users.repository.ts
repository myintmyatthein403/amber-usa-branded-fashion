import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        roleName: true,
        phone: true,
        points: true,
        memberLevel: true,
        status: true,
        joinedAt: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      }
    });
  }

  async findByIdWithFullDetails(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { date: 'desc' }
        },
        refundRequests: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { providerId },
      include: { role: true }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
