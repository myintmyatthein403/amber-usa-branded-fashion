import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { PERMISSIONS_KEY } from './permissions.decorator';

interface JWTPayload {
  sub: string;
  email: string;
  role?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles && !requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request as { user?: JWTPayload };

    if (!user?.sub) {
      if (requiredRoles) return false;
      if (requiredPermissions) return true;
      return false;
    }

    const { role, permissions } = user;

    // Superadmin always has full access
    if (role === 'SUPERADMIN') return true;

    // Check roles
    if (requiredRoles) {
      if (!role || !requiredRoles.includes(role)) {
        return false;
      }
    }

    // Check permissions from JWT
    if (requiredPermissions) {
      const userPermissions = permissions || [];
      const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));
      if (!hasPermission) {
        throw new UnauthorizedException('Insufficient permissions');
      }
    }

    return true;
  }
}