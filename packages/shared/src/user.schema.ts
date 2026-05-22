import { z } from 'zod';

/** Trim + lowercase; empty string becomes null */
export const UsernameSchema = z.preprocess(
  (v) => {
    if (v === null || v === undefined) return v;
    if (typeof v === 'string') {
      const trimmed = v.trim().toLowerCase();
      return trimmed === '' ? null : trimmed;
    }
    return v;
  },
  z
    .union([
      z.null(),
      z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(
          /^[a-z0-9._]+$/,
          'Use lowercase letters, numbers, dot or underscore',
        )
        .refine(
          (val) => !/^[._]|[._]$/.test(val),
          'Cannot start or end with . or _',
        ),
    ])
    .optional(),
);

export const USERNAME_FORMAT_REGEX = /^[a-z0-9._]{3,30}$/;
export const USERNAME_EDGE_REGEX = /^[._]|[._]$/;

export function normalizeUsername(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed === '' ? null : trimmed;
}

export function isUsernameFormatValid(username: string): boolean {
  return (
    USERNAME_FORMAT_REGEX.test(username) && !USERNAME_EDGE_REGEX.test(username)
  );
}

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  username: UsernameSchema,
  name: z.string().min(1, 'Name is required').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
  role: z.string().optional().nullable(),
  roleName: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
  points: z.number().optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  memberLevel: z.string().default('Silver'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

export type User = z.infer<typeof UserSchema>;

export type CreateUserInput = z.infer<typeof UserSchema>;

export type RoleData = {
  id: string;
  name: string;
};

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
