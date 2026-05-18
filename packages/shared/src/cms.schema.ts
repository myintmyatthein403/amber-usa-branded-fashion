import { z } from 'zod';
import { WarehouseSchema, WarehouseLocationSchema, CargoStatusSchema } from './logistics.schema';

export const TestimonialSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, 'Testimonial text is required'),
  author: z.string().min(1, 'Author name is required'),
  location: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
});

export type Testimonial = z.infer<typeof TestimonialSchema> & { id: string };

export const ReviewPlatformSchema = z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK']);

export const ReviewSchema = z.object({
  id: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  userName: z.string().min(1, 'User name is required'),
  userProfileUrl: z.string().nullable().optional(),
  platform: ReviewPlatformSchema.default('WEBSITE'),
  isApproved: z.boolean().default(true),
  productId: z.string().min(1, 'Product selection is required'),
});

export type Review = z.infer<typeof ReviewSchema> & {
  id: string;
  product: { id: string; name: string };
  createdAt: string;
};

export const HeroSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  titlePartOne: z.string().min(1, 'Title Part One is required'),
  titlePartTwo: z.string().optional(),
  titleItalic: z.boolean(),
  description: z.string().min(1, 'Description is required'),
  ctaPrimaryText: z.string().min(1, 'Primary CTA Text is required'),
  ctaPrimaryLink: z.string().min(1, 'Primary CTA Link is required'),
  ctaSecondaryText: z.string().min(1, 'Secondary CTA Text is required'),
  ctaSecondaryLink: z.string().min(1, 'Secondary CTA Link is required'),
  imageMain: z.string().optional().or(z.literal('')),
  imageSecondary: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type HeroSection = z.infer<typeof HeroSectionSchema> & { id: string };
export type CreateHeroSectionInput = z.infer<typeof HeroSectionSchema>;

export const MissionSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleItalic: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  descriptionSecondary: z.string().optional(),
  featureOneTitle: z.string().optional(),
  featureOneDescription: z.string().optional(),
  featureTwoTitle: z.string().optional(),
  featureTwoDescription: z.string().optional(),
  trustBadgeText: z.string().optional(),
  imageMain: z.string().url('Invalid URL for Main Image'),
  imageSecondary: z.string().url('Invalid URL for Secondary Image').optional().or(z.literal('')),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  isActive: z.boolean(),
});

export type MissionSection = z.infer<typeof MissionSectionSchema> & { id: string };
export type CreateMissionSectionInput = z.infer<typeof MissionSectionSchema>;

export const SaleSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleItalic: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  endDate: z.string().min(1, 'End date is required'),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  imageMain: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(false),
});

export type SaleSection = z.infer<typeof SaleSectionSchema> & { id: string };
export type CreateSaleSectionInput = z.infer<typeof SaleSectionSchema>;

export const GiftCardSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().nullable().optional(),
  title: z.string().min(1, 'Title is required'),
  titleSecondary: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  cardTitle: z.string().min(1, 'Card title is required'),
  cardAmount: z.string().min(1, 'Card amount is required'),
  cardType: z.string().min(1, 'Card type is required'),
  amounts: z.array(z.string()).min(1, 'At least one amount is required'),
  isActive: z.boolean().default(false),
});

export type GiftCardSection = z.infer<typeof GiftCardSectionSchema> & { id: string };
export type CreateGiftCardSectionInput = z.infer<typeof GiftCardSectionSchema>;

export const FooterSectionSchema = z.object({
  id: z.string().uuid().optional(),
  companyName: z.string().min(1, 'Company Name is required'),
  companySubtitle: z.string().min(1, 'Company Subtitle is required'),
  companyDescription: z.string().min(1, 'Company Description is required'),
  instagramUrl: z.string().url('Invalid URL for Instagram').optional().or(z.literal('')),
  facebookUrl: z.string().url('Invalid URL for Facebook').optional().or(z.literal('')),
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid Email Address').optional().or(z.literal('')),
  copyrightText: z.string().optional(),
  isActive: z.boolean(),
});

export type FooterSection = z.infer<typeof FooterSectionSchema> & { id: string };
export type CreateFooterSectionInput = z.infer<typeof FooterSectionSchema>;
export type CreateCollectionInput = z.infer<typeof CollectionSchema>;
export type CreateCouponInput = z.infer<typeof CouponSchema>;

export const CollectionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type Collection = z.infer<typeof CollectionSchema> & { id: string };

export const CouponDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);

export const CouponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().nullable().optional(),
  discountType: CouponDiscountTypeSchema.default('PERCENTAGE'),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().nullable().optional(),
  maxDiscount: z.number().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  usageLimit: z.number().nullable().optional(),
  usedCount: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type Coupon = z.infer<typeof CouponSchema> & { id: string };

export const SaleDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);

export const SaleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Sale name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  discountType: SaleDiscountTypeSchema.default('PERCENTAGE'),
  discountValue: z.number().min(0).optional(),
  productIds: z.array(z.string()).default([]),
});

export type Sale = z.infer<typeof SaleSchema> & {
  id: string;
  products?: { id: string; name: string; price: number; onSale: boolean; images?: string[] }[];
};
export type CreateSaleInput = z.infer<typeof SaleSchema>;

export const CargoItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const CreateCargoShipmentSchema = z.object({
  originId: z.string().uuid('Origin warehouse is required'),
  destinationId: z.string().uuid('Destination warehouse is required'),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  departureDate: z.string().optional(),
  items: z.array(CargoItemInputSchema).min(1, 'Cargo must have at least one item'),
  notes: z.string().optional(),
});

export type CreateCargoShipmentInput = z.infer<typeof CreateCargoShipmentSchema>;

export const UpdateCargoShipmentSchema = CreateCargoShipmentSchema.partial().extend({
  status: CargoStatusSchema.optional(),
});

export type UpdateCargoShipmentInput = z.infer<typeof UpdateCargoShipmentSchema>;

export const AdPlacementSchema = z.enum([
  'TOP_BAR',
  'HOME_HERO',
  'HOME_BANNER',
  'PRODUCT_PAGE',
  'POPUP'
]);

export const AdStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const AdSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  linkUrl: z.string().optional(),
  placement: AdPlacementSchema,
  status: AdStatusSchema,
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  priority: z.number().int().min(0)
});

export type Ad = z.infer<typeof AdSchema> & {
  id: string;
  createdAt: string;
};
export type CreateAdInput = z.infer<typeof AdSchema>;

export const CommunityPostSchema = z.object({
  id: z.string().uuid().optional(),
  user: z.string().min(1, 'Username is required'),
  handle: z.string().min(1, 'Handle is required'),
  comment: z.string().min(1, 'Comment is required'),
  image: z.string().min(1, 'Image is required'),
  stars: z.number().min(1).max(5).default(5),
  likes: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CommunityPost = z.infer<typeof CommunityPostSchema> & { id: string };

export const DeliveryMethodSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  isUsdPrice: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  estimatedDays: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  freeOverAmount: z.number().nullable().optional(),
});

export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema> & { id: string };
export type CreateDeliveryMethodInput = z.infer<typeof DeliveryMethodSchema>;

export const GiftCardSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  initialBalance: z.number().min(0),
  currentBalance: z.number().min(0),
  expiryDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  note: z.string().nullable().optional(),
});

export type GiftCard = z.infer<typeof GiftCardSchema> & { id: string };

export const PermissionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const PermissionGroupUISchema = z.object({
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
  _count: z.object({ users: z.number() }).optional(),
});

export type Role = z.infer<typeof RoleSchema> & { id: string };
export type PermissionGroupUI = z.infer<typeof PermissionGroupUISchema>;
export type PermissionItem = z.infer<typeof PermissionItemSchema>;

export const AVAILABLE_PERMISSIONS: z.infer<typeof PermissionGroupUISchema>[] = [
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

export const InventoryItemSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  quantity: z.number(),
  warehouse: z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
  }),
  variant: z.object({
    id: z.string(),
    sku: z.string(),
    size: z.string(),
    color: z.string(),
    stock: z.number(),
    product: z.object({
      id: z.string(),
      name: z.string(),
      images: z.array(z.string()),
    }),
  }),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const SettingsSchema = z.object({
  id: z.string().uuid().optional(),
  privacyPolicy: z.string().nullable().optional(),
  termsConditions: z.string().nullable().optional(),
  usdToMmkRate: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  stripePublishableKey: z.string().nullable().optional(),
  stripeSecretKey: z.string().nullable().optional(),
  stripeWebhookSecret: z.string().nullable().optional(),
});

export type Settings = z.infer<typeof SettingsSchema> & { id: string };

export const MediaItemSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  publicId: z.string(),
  fileName: z.string(),
  format: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  createdAt: z.string().datetime(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;