import { z } from 'zod';

export const PermissionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const PermissionGroupSchema = z.object({
  category: z.string(),
  items: z.array(PermissionItemSchema),
});

export const RoleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  color: z.string().default('text-primary'),
  isImmutable: z.boolean().default(false),
});

export type Role = z.infer<typeof RoleSchema> & { id: string };
export type PermissionGroup = z.infer<typeof PermissionGroupSchema>;
export type PermissionItem = z.infer<typeof PermissionItemSchema>;

export const AVAILABLE_PERMISSIONS: PermissionGroup[] = [
  {
    category: 'Catalog Management',
    items: [
      { id: 'products:read', label: 'View Products' },
      { id: 'products:write', label: 'Manage Products & Variants' },
      { id: 'categories:manage', label: 'Manage Categories' },
      { id: 'brands:manage', label: 'Manage Brands' },
    ]
  },
  {
    category: 'Sales & Marketing',
    items: [
      { id: 'orders:manage', label: 'Manage Orders & Fulfillment' },
      { id: 'marketing:manage', label: 'Manage Campaigns & Coupons' },
      { id: 'giftcards:manage', label: 'Manage Gift Cards' },
      { id: 'ads:manage', label: 'Ads & Promotions' },
    ]
  },
  {
    category: 'Website Content',
    items: [
      { id: 'content:manage', label: 'Update Sections (Hero, Mission)' },
      { id: 'reviews:manage', label: 'Review & Approve Feedback' },
      { id: 'community:manage', label: 'Community Posts Moderation' },
    ]
  },
  {
    category: 'System & Security',
    items: [
      { id: 'staff:manage', label: 'Manage Staff Directory' },
      { id: 'roles:manage', label: 'Manage Roles & RBAC' },
      { id: 'settings:manage', label: 'Global System Settings' },
    ]
  }
];

export type CreateRoleInput = {
  id?: string;
  name: string;
  description?: string;
  permissions: string[];
  color?: string;
  isImmutable?: boolean;
};