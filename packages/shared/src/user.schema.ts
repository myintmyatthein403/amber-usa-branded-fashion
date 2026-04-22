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

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
