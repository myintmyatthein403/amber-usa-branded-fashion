import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 1. If NO USER is present:
    // - If ROLES are required: block (Roles always require auth)
    // - If only PERMISSIONS are required: allow (assume public access is permitted)
    if (!user) {
      if (requiredRoles) return false;
      if (requiredPermissions) return true;
      return false;
    }

    // 2. If USER is present, perform "live" check:
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true },
    });

    if (!dbUser || !dbUser.role) return false;

    // Superadmin always has full access
    if (dbUser.roleName === 'SUPERADMIN') return true;

    // Check Roles (High-level override)
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => dbUser.roleName === role);
      if (hasRole) return true;
    }

    // Check Permissions (Granular control)
    // If a user is logged in and permissions are specified, they MUST have them.
    if (requiredPermissions) {
      const userPermissions = dbUser.role.permissions || [];
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );
      return hasPermission;
    }

    return false;
  }
}
