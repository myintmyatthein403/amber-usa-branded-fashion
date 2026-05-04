import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { sanitizeData } from '../common/utils/data-sanitizer';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll() {
    const users = await this.usersRepository.findAll();
    return users.map((user) => ({
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

  async create(data: CreateUserDto, currentUser: JwtPayload) {
    if (
      currentUser.role !== 'SUPERADMIN' &&
      (data.roleName === 'ADMIN' || data.roleName === 'SUPERADMIN')
    ) {
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

  async update(id: string, data: UpdateUserDto, currentUser: JwtPayload) {
    const userToUpdate = await this.usersRepository.findById(id);
    if (!userToUpdate) throw new NotFoundException('User not found');

    if (
      currentUser.role === 'ADMIN' &&
      userToUpdate.roleName === 'SUPERADMIN'
    ) {
      throw new ForbiddenException('Admins cannot modify Superadmins');
    }

    if (
      currentUser.role === 'ADMIN' &&
      userToUpdate.roleName === 'ADMIN' &&
      currentUser.userId !== id
    ) {
      throw new ForbiddenException('Admins cannot modify other Admins');
    }

    if (currentUser.role === 'ADMIN' && data.roleName === 'SUPERADMIN') {
      throw new ForbiddenException('Admins cannot grant Superadmin privileges');
    }

    if (
      currentUser.role === 'ADMIN' &&
      data.roleName &&
      data.roleName !== userToUpdate.roleName
    ) {
      if (userToUpdate.roleName === 'USER' && data.roleName !== 'USER') {
        throw new ForbiddenException(
          'Admins cannot promote customers to staff roles',
        );
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

  async remove(id: string, currentUser: JwtPayload) {
    const userToDelete = await this.usersRepository.findById(id);
    if (!userToDelete) throw new NotFoundException('User not found');

    if (
      currentUser.role === 'ADMIN' &&
      userToDelete.roleName === 'SUPERADMIN'
    ) {
      throw new ForbiddenException('Admins cannot delete Superadmins');
    }

    if (
      currentUser.role === 'ADMIN' &&
      userToDelete.roleName === 'ADMIN' &&
      currentUser.userId !== id
    ) {
      throw new ForbiddenException('Admins cannot delete other admins');
    }

    return this.usersRepository.delete(id);
  }
}
