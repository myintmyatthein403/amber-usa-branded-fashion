import { z } from 'zod';

export const BrandFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().optional(),
  note: z.string().optional(),
});

export type BrandFormData = z.infer<typeof BrandFormDataSchema>;

export const CategoryFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9-_]+$/, 'Slug must be alphanumeric/hyphens').optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  parentId: z.string().uuid().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof CategoryFormDataSchema>;

export const ProductFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  detail: z.string().optional(),
  note: z.string().optional(),
  price: z.union([z.string(), z.number()]),
  compareAtPrice: z.union([z.string(), z.number()]).optional(),
  isUsdPrice: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  saleId: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  variants: z.array(z.any()).default([]),
});

export type ProductFormData = z.infer<typeof ProductFormDataSchema>;

export const VariantFormDataSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0).default(0),
  price: z.union([z.string(), z.number()]).optional(),
  compareAtPrice: z.union([z.string(), z.number()]).optional(),
  weight: z.union([z.string(), z.number()]).optional(),
  images: z.array(z.string()).default([]),
  isPreOrder: z.boolean().default(false),
  warehouseId: z.string().optional(),
  productId: z.string().optional(),
  lowStockThreshold: z.number().min(0).default(5),
});

export type VariantFormData = z.infer<typeof VariantFormDataSchema>;

export const WarehouseFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.enum(['USA', 'MYANMAR']).default('USA'),
  address: z.string().optional(),
});

export type WarehouseFormData = z.infer<typeof WarehouseFormDataSchema>;

export const DeliveryMethodFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0),
  isUsdPrice: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  estimatedDays: z.string().optional(),
  isActive: z.boolean().default(true),
  freeOverAmount: z.number().optional(),
  logoUrl: z.string().optional(),
  logoLink: z.string().optional(),
  locationPrices: z.record(z.number()).optional(),
});

export type DeliveryMethodFormData = z.infer<typeof DeliveryMethodFormDataSchema>;

export const CouponFormDataSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  expiryDate: z.string().optional(),
  usageLimit: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type CouponFormData = z.infer<typeof CouponFormDataSchema>;

export const GiftCardFormDataSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  initialBalance: z.number().min(0),
  currentBalance: z.number().min(0).optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().default(true),
  note: z.string().optional(),
});

export type GiftCardFormData = z.infer<typeof GiftCardFormDataSchema>;

export const CollectionFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CollectionFormData = z.infer<typeof CollectionFormDataSchema>;

export const SaleFormDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  discountValue: z.number().min(0).optional(),
  productIds: z.array(z.string()).default([]),
});

export type SaleFormData = z.infer<typeof SaleFormDataSchema>;

export const TestimonialFormDataSchema = z.object({
  text: z.string().min(1, 'Testimonial text is required'),
  author: z.string().min(1, 'Author name is required'),
  location: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
});

export type TestimonialFormData = z.infer<typeof TestimonialFormDataSchema>;

export const ReviewFormDataSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  userName: z.string().min(1, 'User name is required'),
  userProfileUrl: z.string().optional(),
  platform: z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK']).default('WEBSITE'),
  isApproved: z.boolean().default(true),
  productId: z.string().min(1, 'Product selection is required'),
});

export type ReviewFormData = z.infer<typeof ReviewFormDataSchema>;

export const RoleFormDataSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  color: z.string().default('text-primary'),
  isImmutable: z.boolean().default(false),
});

export type RoleFormData = z.infer<typeof RoleFormDataSchema>;

export const UserFormDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().optional(),
  name: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roleName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  memberLevel: z.string().default('Silver'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

export type UserFormData = z.infer<typeof UserFormDataSchema>;

export const HeroSectionFormDataSchema = z.object({
  badge: z.string().optional(),
  titlePartOne: z.string().min(1, 'Title Part One is required'),
  titlePartTwo: z.string().optional(),
  titleItalic: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
  ctaPrimaryText: z.string().min(1, 'Primary CTA Text is required'),
  ctaPrimaryLink: z.string().min(1, 'Primary CTA Link is required'),
  ctaSecondaryText: z.string().min(1, 'Secondary CTA Text is required'),
  ctaSecondaryLink: z.string().min(1, 'Secondary CTA Link is required'),
  imageMain: z.string().url('Invalid URL for Main Image'),
  imageSecondary: z.string().url('Invalid URL for Secondary Image').optional().or(z.literal('')),
  isActive: z.boolean().default(false),
});

export type HeroSectionFormData = z.infer<typeof HeroSectionFormDataSchema>;

export const MissionSectionFormDataSchema = z.object({
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
  isActive: z.boolean().default(false),
});

export type MissionSectionFormData = z.infer<typeof MissionSectionFormDataSchema>;

export const SaleSectionFormDataSchema = z.object({
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

export type SaleSectionFormData = z.infer<typeof SaleSectionFormDataSchema>;

export const GiftCardSectionFormDataSchema = z.object({
  badge: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleSecondary: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  cardTitle: z.string().min(1, 'Card title is required'),
  cardAmount: z.string().min(1, 'Card amount is required'),
  cardType: z.string().min(1, 'Card type is required'),
  amounts: z.array(z.string()).min(1, 'At least one amount is required'),
  isActive: z.boolean().default(false),
});

export type GiftCardSectionFormData = z.infer<typeof GiftCardSectionFormDataSchema>;

export const FooterSectionFormDataSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  companySubtitle: z.string().min(1, 'Company Subtitle is required'),
  companyDescription: z.string().min(1, 'Company Description is required'),
  instagramUrl: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  facebookUrl: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid Email Address').optional().or(z.literal('')),
  copyrightText: z.string().optional(),
  isActive: z.boolean().default(false),
});

export type FooterSectionFormData = z.infer<typeof FooterSectionFormDataSchema>;

export const CommunityPostFormDataSchema = z.object({
  user: z.string().min(1, 'Username is required'),
  handle: z.string().min(1, 'Handle is required'),
  comment: z.string().min(1, 'Comment is required'),
  image: z.string().min(1, 'Image is required'),
  stars: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  id: z.string().optional(),
  likes: z.number().optional(),
});

export type CommunityPostFormData = z.infer<typeof CommunityPostFormDataSchema>;

export const AdFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  linkUrl: z.string().optional(),
  placement: z.enum(['TOP_BAR', 'HOME_HERO', 'HOME_BANNER', 'PRODUCT_PAGE', 'POPUP']),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.number().int().min(0).default(0),
});

export type AdFormData = z.infer<typeof AdFormDataSchema>;

export const SettingsFormDataSchema = z.object({
  privacyPolicy: z.string().optional(),
  termsConditions: z.string().optional(),
  usdToMmkRate: z.union([z.string(), z.number()]),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof SettingsFormDataSchema>;