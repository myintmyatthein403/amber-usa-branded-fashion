import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      return ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async googleLogin(idToken: string) {
    const payload = await this.verifyGoogleToken(idToken);
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google payload');
    }

    const { email, sub: providerId, name, picture: avatar } = payload;

    // Try to find user by providerId first
    let user = await this.prisma.user.findUnique({
      where: { providerId },
    });

    if (!user) {
      // Try to find user by email
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link existing user to Google
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { 
            provider: 'google', 
            providerId,
            avatar: user.avatar || avatar
          },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            provider: 'google',
            providerId,
            avatar,
            roleName: 'USER',
          },
        });
      }
    }

    return this.login(user);
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
