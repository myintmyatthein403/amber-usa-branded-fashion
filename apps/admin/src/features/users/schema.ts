import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().nullable(),
  name: z.string().min(1, 'Name is required').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
  roleName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  memberLevel: z.string().default('Silver'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

export type User = z.infer<typeof UserSchema>;

export type CreateUserInput = {
  id?: string;
  email: string;
  username?: string | null;
  name?: string | null;
  roleName?: string | null;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  memberLevel?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  password?: string;
};

export type RoleData = {
  id: string;
  name: string;
};