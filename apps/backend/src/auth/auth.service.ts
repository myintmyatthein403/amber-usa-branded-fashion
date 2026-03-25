import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });
    
    const permissions = fullUser?.role?.permissions || [];
    const payload = { email: user.email, sub: user.id, role: user.roleName, permissions };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.roleName,
        permissions: permissions,
      },
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        roleName: 'USER',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return {
      ...result,
      role: user.roleName,
      permissions: user.role?.permissions || [],
    };
  }

  async updateProfile(userId: string, profileData: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: profileData.name,
        username: profileData.username,
        phone: profileData.phone,
        address: profileData.address,
        avatar: profileData.avatar,
      },
    });
    const { password, ...result } = user;
    return result;
  }
}
