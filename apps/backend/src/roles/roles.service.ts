import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: any) {
    const existing = await this.prisma.role.findUnique({
      where: { name: data.name },
    });
    if (existing) throw new ConflictException('Role already exists');

    return this.prisma.role.create({
      data,
    });
  }

  async update(id: string, data: any) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    if (role.isImmutable && data.name && data.name !== role.name) {
      throw new ForbiddenException('Cannot rename an immutable role');
    }

    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found');

    if (role.isImmutable) {
      throw new ForbiddenException('Cannot delete an immutable role');
    }

    if (role._count.users > 0) {
      throw new ForbiddenException(
        'Cannot delete a role that is assigned to users',
      );
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
