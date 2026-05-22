import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { User, Prisma } from '@prisma/client';
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

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
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
    const { password, role, ...result } = user as any;
    return {
      ...result,
      role: user.roleName,
      permissions: role?.permissions || [],
    };
  }

  async updateProfile(userId: string, profileData: any) {
    const data: Prisma.UserUpdateInput = {
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      avatar: profileData.avatar,
    };

    if (profileData.username !== undefined) {
      const raw = profileData.username;
      const username =
        typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
      const normalized = username === '' ? null : username;

      if (normalized) {
        const current = await this.usersRepository.findById(userId);
        if (current?.username !== normalized) {
          const existing =
            await this.usersRepository.findByUsername(normalized);
          if (existing && existing.id !== userId) {
            throw new ConflictException('That username is already taken');
          }
        }
      }

      data.username = normalized;
    }

    try {
      const user = await this.usersRepository.update(userId, data);
      const { password, ...result } = user;
      return result;
    } catch (e: any) {
      if (
        e?.code === 'P2002' &&
        (e?.meta?.target as string[] | undefined)?.includes('username')
      ) {
        throw new ConflictException('That username is already taken');
      }
      throw e;
    }
  }

  async isUsernameAvailable(userId: string, raw: string) {
    const username = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    if (!username) {
      return { available: false, reason: 'empty' as const };
    }
    if (!/^[a-z0-9._]{3,30}$/.test(username)) {
      return { available: false, reason: 'format' as const };
    }
    if (/^[._]|[._]$/.test(username)) {
      return { available: false, reason: 'format' as const };
    }

    const existing = await this.usersRepository.findByUsername(username);
    return {
      available: !existing || existing.id === userId,
      normalized: username,
    };
  }

  /** Stub: wire to email provider when SMTP is configured */
  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      // TODO: generate token, persist, send email
    }
    return {
      message:
        'If an account exists for this email, password reset instructions will be sent when email delivery is configured.',
    };
  }

  /** Stub: validate token and update password when reset flow is fully implemented */
  async resetPassword(_token: string, _newPassword: string) {
    return {
      message:
        'Password reset is not yet enabled. Please contact support or use Google sign-in.',
    };
  }
}
