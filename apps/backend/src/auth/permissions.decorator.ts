import { SetMetadata } from '@nestjs/common';
import { Permission } from '@amber/shared';

export const PERMISSIONS_KEY = 'permissions';

type PermissionArg = Permission | string;

export const Permissions = (...permissions: PermissionArg[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
