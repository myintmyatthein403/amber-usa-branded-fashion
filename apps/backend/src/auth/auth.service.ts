import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { RegisterInput, LoginInput, User as UserInput } from '@amber/shared';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
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

    let user = await this.usersRepository.findByProviderId(providerId);

    if (!user) {
      user = await this.usersRepository.findByEmail(email);

      if (user) {
        user = await this.usersRepository.update(user.id, {
          provider: 'google',
          providerId,
          avatar: user.avatar || avatar,
        });
      } else {
        user = await this.usersRepository.create({
          email,
          name,
          provider: 'google',
          providerId,
          avatar,
          role: {
            connect: { name: 'USER' },
          },
        });
      }
    }

    return this.login(user);
  }

  async login(user: any) {
    const fullUser = await this.usersRepository.findById(user.id);
    const permissions = (fullUser as any)?.role?.permissions || [];
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.roleName,
      permissions,
    };

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
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: {
        connect: { name: 'USER' },
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findByIdWithFullDetails(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return {
      ...result,
      role: user.roleName,
      permissions: (user as any).role?.permissions || [],
    };
  }

  async updateProfile(userId: string, profileData: any) {
    const user = await this.usersRepository.update(userId, {
      name: profileData.name,
      username: profileData.username,
      phone: profileData.phone,
      address: profileData.address,
      avatar: profileData.avatar,
    });
    const { password, ...result } = user;
    return result;
  }
}
