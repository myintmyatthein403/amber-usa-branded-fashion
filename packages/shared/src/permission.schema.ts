export enum Permission {
  PRODUCTS_READ = 'products:read',
  PRODUCTS_WRITE = 'products:write',
  CATEGORIES_MANAGE = 'categories:manage',
  BRANDS_MANAGE = 'brands:manage',
  ORDERS_MANAGE = 'orders:manage',
  LOGISTICS_MANAGE = 'logistics:manage',
  STAFF_MANAGE = 'staff:manage',
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
  CONTENT_MANAGE = 'content:manage',
}

export const PermissionGroup = {
  PRODUCTS: [Permission.PRODUCTS_READ, Permission.PRODUCTS_WRITE],
  CATEGORIES: [Permission.CATEGORIES_MANAGE],
  BRANDS: [Permission.BRANDS_MANAGE],
  ORDERS: [Permission.ORDERS_MANAGE],
  LOGISTICS: [Permission.LOGISTICS_MANAGE],
  MARKETING: [
    Permission.MARKETING_MANAGE,
    Permission.GIFT_CARDS_MANAGE,
    Permission.ADS_MANAGE,
    Permission.SALES_MANAGE,
    Permission.COUPONS_MANAGE,
    Permission.COLLECTIONS_MANAGE,
  ],
  SETTINGS: [Permission.SETTINGS_MANAGE],
  USERS: [Permission.USERS_MANAGE, Permission.ROLES_MANAGE, Permission.STAFF_MANAGE],
  CONTENT: [
    Permission.CONTENT_MANAGE,
    Permission.REVIEWS_MANAGE,
    Permission.HERO_MANAGE,
    Permission.COMMUNITY_MANAGE,
  ],
} as const;

export const PermissionLabels: Record<Permission, string> = {
  [Permission.PRODUCTS_READ]: 'View Products',
  [Permission.PRODUCTS_WRITE]: 'Manage Products & Variants',
  [Permission.CATEGORIES_MANAGE]: 'Manage Categories',
  [Permission.BRANDS_MANAGE]: 'Manage Brands',
  [Permission.ORDERS_MANAGE]: 'Manage Orders & Fulfillment',
  [Permission.LOGISTICS_MANAGE]: 'Manage Logistics & Warehouses',
  [Permission.MARKETING_MANAGE]: 'Manage Marketing',
  [Permission.GIFT_CARDS_MANAGE]: 'Manage Gift Cards',
  [Permission.ADS_MANAGE]: 'Manage Ads',
  [Permission.SETTINGS_MANAGE]: 'Manage Settings',
  [Permission.USERS_MANAGE]: 'Manage Users',
  [Permission.ROLES_MANAGE]: 'Manage Roles',
  [Permission.STAFF_MANAGE]: 'Manage Staff',
  [Permission.REVIEWS_MANAGE]: 'Manage Reviews',
  [Permission.COLLECTIONS_MANAGE]: 'Manage Collections',
  [Permission.SALES_MANAGE]: 'Manage Sales',
  [Permission.COUPONS_MANAGE]: 'Manage Coupons',
  [Permission.HERO_MANAGE]: 'Manage Hero Section',
  [Permission.COMMUNITY_MANAGE]: 'Manage Community Posts',
  [Permission.CONTENT_MANAGE]: 'Manage Content',
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