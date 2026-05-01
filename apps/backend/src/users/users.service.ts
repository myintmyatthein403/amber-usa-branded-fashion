import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async findAll() {
    const users = await this.usersRepository.findAll();
    return users.map(user => ({
      ...user,
      role: user.roleName,
    }));
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findByIdWithFullDetails(id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async create(data: any, currentUser: any) {
    // Only SUPERADMIN can create staff
    if (currentUser.role !== 'SUPERADMIN' && (data.roleName === 'ADMIN' || data.roleName === 'SUPERADMIN')) {
      throw new ForbiddenException('Only Superadmins can create staff members');
    }

    const sanitizedData = sanitizeData(data);
    if (sanitizedData.password) {
      sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
    }

    const user = await this.usersRepository.create(sanitizedData);
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, data: any, currentUser: any) {
    const userToUpdate = await this.usersRepository.findById(id);
    if (!userToUpdate) throw new NotFoundException('User not found');

    // Rule: ADMIN cannot modify or delete a SUPERADMIN
    if (currentUser.role === 'ADMIN' && userToUpdate.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot modify Superadmins');
    }

    // Rule: ADMIN cannot modify another ADMIN
    if (currentUser.role === 'ADMIN' && userToUpdate.roleName === 'ADMIN' && currentUser.userId !== id) {
      throw new ForbiddenException('Admins cannot modify other Admins');
    }

    // Rule: ADMIN cannot elevate their own role or others to SUPERADMIN
    if (currentUser.role === 'ADMIN' && data.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot grant Superadmin privileges');
    }

    // Rule: Only SUPERADMIN can change roles of other staff
    if (currentUser.role === 'ADMIN' && data.roleName && data.roleName !== userToUpdate.roleName) {
      if (userToUpdate.roleName === 'USER' && data.roleName !== 'USER') {
         throw new ForbiddenException('Admins cannot promote customers to staff roles');
      }
    }

    const sanitizedData = sanitizeData(data);
    if (sanitizedData.password) {
      sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, sanitizedData);
    const { password: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: string, currentUser: any) {
    const userToDelete = await this.usersRepository.findById(id);
    if (!userToDelete) throw new NotFoundException('User not found');

    // Rule: ADMIN cannot delete a SUPERADMIN
    if (currentUser.role === 'ADMIN' && userToDelete.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot delete Superadmins');
    }

    // Rule: ADMIN cannot delete another ADMIN
    if (currentUser.role === 'ADMIN' && userToDelete.roleName === 'ADMIN' && currentUser.userId !== id) {
       throw new ForbiddenException('Admins cannot delete other admins');
    }

    return this.usersRepository.delete(id);
  }
}
