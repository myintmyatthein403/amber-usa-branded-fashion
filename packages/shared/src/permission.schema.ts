export enum Permission {
  PRODUCTS_READ = 'products:read',
  PRODUCTS_WRITE = 'products:write',
  CATEGORIES_MANAGE = 'categories:manage',
  BRANDS_MANAGE = 'brands:manage',
  ORDERS_MANAGE = 'orders:manage',
  MARKETING_MANAGE = 'marketing:manage',
  GIFT_CARDS_MANAGE = 'giftcards:manage',
  ADS_MANAGE = 'ads:manage',
  SETTINGS_MANAGE = 'settings:manage',
  USERS_MANAGE = 'users:manage',
  ROLES_MANAGE = 'roles:manage',
  REVIEWS_MANAGE = 'reviews:manage',
  COLLECTIONS_MANAGE = 'collections:manage',
  SALES_MANAGE = 'sales:manage',
  COUPONS_MANAGE = 'coupons:manage',
  HERO_MANAGE = 'hero:manage',
  COMMUNITY_MANAGE = 'community:manage',
}

export const PermissionGroup = {
  PRODUCTS: [Permission.PRODUCTS_READ, Permission.PRODUCTS_WRITE],
  CATEGORIES: [Permission.CATEGORIES_MANAGE],
  BRANDS: [Permission.BRANDS_MANAGE],
  ORDERS: [Permission.ORDERS_MANAGE],
  MARKETING: [
    Permission.MARKETING_MANAGE,
    Permission.GIFT_CARDS_MANAGE,
    Permission.ADS_MANAGE,
    Permission.SALES_MANAGE,
    Permission.COUPONS_MANAGE,
  ],
  SETTINGS: [Permission.SETTINGS_MANAGE],
  USERS: [Permission.USERS_MANAGE, Permission.ROLES_MANAGE],
  CONTENT: [
    Permission.REVIEWS_MANAGE,
    Permission.COLLECTIONS_MANAGE,
    Permission.HERO_MANAGE,
    Permission.COMMUNITY_MANAGE,
  ],
} as const;

export type PermissionGroup = (typeof PermissionGroup)[keyof typeof PermissionGroup];

export const PermissionLabels: Record<Permission, string> = {
  [Permission.PRODUCTS_READ]: 'View Products',
  [Permission.PRODUCTS_WRITE]: 'Manage Products & Variants',
  [Permission.CATEGORIES_MANAGE]: 'Manage Categories',
  [Permission.BRANDS_MANAGE]: 'Manage Brands',
  [Permission.ORDERS_MANAGE]: 'Manage Orders & Fulfillment',
  [Permission.MARKETING_MANAGE]: 'Manage Marketing',
  [Permission.GIFT_CARDS_MANAGE]: 'Manage Gift Cards',
  [Permission.ADS_MANAGE]: 'Manage Ads',
  [Permission.SETTINGS_MANAGE]: 'Manage Settings',
  [Permission.USERS_MANAGE]: 'Manage Users',
  [Permission.ROLES_MANAGE]: 'Manage Roles',
  [Permission.REVIEWS_MANAGE]: 'Manage Reviews',
  [Permission.COLLECTIONS_MANAGE]: 'Manage Collections',
  [Permission.SALES_MANAGE]: 'Manage Sales',
  [Permission.COUPONS_MANAGE]: 'Manage Coupons',
  [Permission.HERO_MANAGE]: 'Manage Hero Section',
  [Permission.COMMUNITY_MANAGE]: 'Manage Community Posts',
};

export function hasPermission(
  userPermissions: Permission[] | string[],
  required: Permission,
): boolean {
  return userPermissions.includes(required as any) || userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: Permission[] | string[],
  required: Permission[],
): boolean {
  return required.some((p) => hasPermission(userPermissions, p));
}

export function hasAllPermissions(
  userPermissions: Permission[] | string[],
  required: Permission[],
): boolean {
  return required.every((p) => hasPermission(userPermissions, p));
}