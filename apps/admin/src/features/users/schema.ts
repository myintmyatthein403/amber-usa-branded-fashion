import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  username: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  role: z.string(),
  phone: z.string().nullable().optional(),
  points: z.number().default(0),
  memberLevel: z.string().default('Silver'),
  status: z.string().default('ACTIVE'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type User = z.infer<typeof UserSchema> & { id: string };
export type CreateUserInput = z.infer<typeof UserSchema>;

export interface RoleData {
  id: string;
  name: string;
}
