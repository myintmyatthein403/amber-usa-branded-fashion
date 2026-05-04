import { z } from 'zod';
import { UserSchema } from '@amber/shared';

export const CreateUserDto = UserSchema;
export const UpdateUserDto = UserSchema.partial();

export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UserQueryDto = z.object({
  roleName: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UserQueryDto = z.infer<typeof UserQueryDto>;