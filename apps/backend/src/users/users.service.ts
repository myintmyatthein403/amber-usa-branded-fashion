import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
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
    });

    return users.map(user => ({
      ...user,
      role: user.roleName,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        refundRequests: true,
        role: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async create(data: any, currentUser: any) {
    // Only SUPERADMIN can create staff
    if (currentUser.role !== 'SUPERADMIN' && (data.roleName === 'ADMIN' || data.roleName === 'SUPERADMIN')) {
      throw new ForbiddenException('Only Superadmins can create staff members');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: any, currentUser: any) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new NotFoundException('User not found');

    // Rule: ADMIN cannot modify or delete a SUPERADMIN
    if (currentUser.role === 'ADMIN' && userToUpdate.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot modify Superadmins');
    }

    // Rule: ADMIN cannot elevate their own role or others to SUPERADMIN
    if (currentUser.role === 'ADMIN' && data.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot grant Superadmin privileges');
    }

    // Rule: Only SUPERADMIN can change roles of other staff
    if (currentUser.role === 'ADMIN' && data.roleName && data.roleName !== userToUpdate.roleName) {
      // Allow Admin to change USER to USER (no change) or prevent elevating to ADMIN/SUPERADMIN
      if (userToUpdate.roleName === 'USER' && data.roleName !== 'USER') {
         throw new ForbiddenException('Admins cannot promote customers to staff roles');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, currentUser: any) {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) throw new NotFoundException('User not found');

    // Rule: ADMIN cannot delete a SUPERADMIN
    if (currentUser.role === 'ADMIN' && userToDelete.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot delete Superadmins');
    }

    // Rule: ADMIN cannot delete another ADMIN
    if (currentUser.role === 'ADMIN' && userToDelete.roleName === 'ADMIN' && currentUser.userId !== id) {
       throw new ForbiddenException('Admins cannot delete other admins');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
