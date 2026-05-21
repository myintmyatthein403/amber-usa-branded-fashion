import { PrismaClient, ProductStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Roles
  const roles = [
    {
      name: 'SUPERADMIN',
      description: 'Complete system access and ownership. Can manage all staff, settings, and financial data.',
      permissions: [
        'products:read', 'products:write', 'categories:manage', 'brands:manage',
        'orders:manage', 'logistics:manage',
        'marketing:manage', 'giftcards:manage', 'ads:manage', 'sales:manage', 'coupons:manage', 'collections:manage',
        'content:manage', 'reviews:manage', 'community:manage', 'hero:manage',
        'staff:manage', 'roles:manage', 'settings:manage', 'users:manage'
      ],
      color: 'text-primary',
      isImmutable: true,
    },
    {
      name: 'ADMIN',
      description: 'Operational manager. Can manage products, orders, customers, and website content.',
      permissions: [
        'products:read', 'products:write', 'categories:manage', 'brands:manage',
        'orders:manage', 'logistics:manage', 'marketing:manage', 'ads:manage',
        'content:manage', 'reviews:manage', 'community:manage', 'hero:manage',
        'sales:manage', 'coupons:manage', 'collections:manage'
      ],
      color: 'text-emerald-500',
      isImmutable: true,
    },
    {
      name: 'USER',
      description: 'Standard customer account. Can browse, purchase, and manage their own profile.',
      permissions: [
        'products:read'
      ],
      color: 'text-muted-foreground',
      isImmutable: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        permissions: role.permissions,
        description: role.description,
        color: role.color,
      },
      create: role,
    });
  }

  console.log('Roles created');

  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'superadmin@amber.com' },
    update: {},
    create: {
      email: 'superadmin@amber.com',
      password: hashedPassword,
      name: 'Super Admin',
      roleName: 'SUPERADMIN',
    },
  });

  console.log('Superadmin created');

  const accessories = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { 
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories',
      displayOrder: 1
    },
  });

  const apparel = await prisma.category.upsert({
    where: { name: 'Apparel' },
    update: {},
    create: { 
      name: 'Apparel',
      slug: 'apparel',
      description: 'Clothing and apparel',
      displayOrder: 2
    },
  });

  const footwear = await prisma.category.upsert({
    where: { name: 'Footwear' },
    update: {},
    create: { 
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes and footwear',
      displayOrder: 3
    },
  });

  const coachBrand = await prisma.brand.upsert({
    where: { name: 'Coach' },
    update: {},
    create: { 
      name: 'Coach',
      logo: 'https://logo.clearbit.com/coach.com',
      note: 'American luxury fashion house'
    },
  });

  const nikeBrand = await prisma.brand.upsert({
    where: { name: 'Nike' },
    update: {},
    create: {
      name: 'Nike',
      logo: 'https://logo.clearbit.com/nike.com',
      note: 'Global leader in athletic footwear and apparel'
    }
  });

  const tote = await prisma.product.upsert({
    where: { slug: 'coach-signature-canvas-tote' },
    update: {},
    create: {
      name: 'Coach Signature Canvas Tote',
      slug: 'coach-signature-canvas-tote',
      status: ProductStatus.PUBLISHED,
      brandId: coachBrand.id,
      shortDescription: 'Classic Coach tote.',
      description: 'Classic Coach tote with refined calf leather details.',
      price: 325.00,
      categoryId: accessories.id,
      metaTitle: 'Coach Signature Tote | Amber Fashion',
      tags: ['luxury', 'leather', 'tote'],
    },
  });

  const airmax = await prisma.product.upsert({
    where: { slug: 'nike-air-max-270' },
    update: {},
    create: {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      status: ProductStatus.PUBLISHED,
      brandId: nikeBrand.id,
      shortDescription: 'Style and comfort with a big attitude.',
      description: 'The Nike Air Max 270 delivers unrivaled, all-day comfort with its large window and fresh array of colors.',
      price: 150.00,
      categoryId: footwear.id,
      metaTitle: 'Nike Air Max 270 | Amber Fashion',
      tags: ['athletic', 'lifestyle', 'sneakers'],
    }
  });

  await prisma.heroSection.upsert({
    where: { id: 'default-hero' },
    update: {},
    create: {
      id: 'default-hero',
      badge: 'Authentic USA Brands • Myanmar',
      titlePartOne: 'Global',
      titlePartTwo: 'Authenticity',
      titleItalic: true,
      description: 'Bringing your favorite premium USA brands directly to Myanmar. 100% Guaranteed Authentic clothing and accessories at the fairest prices.',
      ctaPrimaryText: 'Shop Brands',
      ctaPrimaryLink: '/shop',
      ctaSecondaryText: 'Check Legitimacy',
      ctaSecondaryLink: '/track',
      imageMain: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
      imageSecondary: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
      isActive: true
    }
  });

  await prisma.missionSection.upsert({
    where: { id: 'default-mission' },
    update: {},
    create: {
      id: 'default-mission',
      badge: 'Our Mission',
      title: 'Real Brands.',
      titleItalic: 'Fair Price.',
      description: 'Amber Premium was born from a simple need: access to genuine international brands in Myanmar without the sky-high markups.',
      descriptionSecondary: 'We bridge the gap between global fashion and our local community. Every item in our shop is sourced directly from brand outlets and authorized retailers in the USA, ensuring you get exactly what you pay for.',
      featureOneTitle: 'Direct Import',
      featureOneDescription: 'Sourced directly from USA Brand Outlets.',
      featureTwoTitle: 'Fair Pricing',
      featureTwoDescription: 'Transparent costs with no hidden fees.',
      trustBadgeText: 'Directly Imported from Official USA Stores. 100% Legit.',
      imageMain: 'https://images.unsplash.com/photo-1555529669-e69e7aa0bd9a?q=80&w=800&auto=format&fit=crop',
      imageSecondary: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
      ctaText: 'Shop All Authentic Brands',
      ctaLink: '/shop',
      isActive: true
    }
  });

  await prisma.giftCardSection.upsert({
    where: { id: 'default-gift-card-section' },
    update: {},
    create: {
      id: 'default-gift-card-section',
      badge: 'The Ultimate Gift',
      title: 'Share the Luxury',
      titleSecondary: 'of Authentic Fashion',
      description: 'Not sure what to pick? Our digital gift cards are the perfect way to give them exactly what they want.',
      ctaText: 'Purchase a Gift Card',
      ctaLink: '/gift-cards',
      cardTitle: 'Amber',
      cardAmount: '100,000 MMK',
      cardType: 'Gift Card',
      isActive: true
    }
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 12);

  await prisma.saleSection.upsert({
    where: { id: 'default-sale-section' },
    update: {},
    create: {
      id: 'default-sale-section',
      badge: 'Limited Time Event',
      title: 'Thingyan',
      titleItalic: 'Mega Sale',
      description: 'Celebrate the Myanmar New Year with authentic USA brands at unprecedented prices. Genuine Coach, Nike, and Adidas items — 100% Authentic.',
      endDate: tomorrow,
      ctaText: 'Shop the Sale',
      ctaLink: '/shop',
      imageMain: 'https://images.unsplash.com/photo-1555529669-e69e7aa0bd9a?q=80&w=800&auto=format&fit=crop',
      isActive: true
    }
  });

  await prisma.footerSection.upsert({
    where: { id: 'default-footer-section' },
    update: {},
    create: {
      id: 'default-footer-section',
      companyName: 'Amber',
      companySubtitle: 'Premium USA Brands',
      companyDescription: 'Amber Premium is Myanmar\'s trusted destination for authentic USA branded fashion. Bringing global quality to your doorstep at competitive prices.',
      instagramUrl: 'https://instagram.com',
      facebookUrl: 'https://www.facebook.com/amberbrandfashion',
      contactAddress: 'Yangon, Myanmar',
      contactPhone: '+95 9 123 456 789',
      contactEmail: 'hello@amberpremium.com',
      copyrightText: '© 2026 Amber Premium. Authentic USA Brands.',
      isActive: true
    }
  });

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      {
        text: "Amber Premium has completely changed how I shop for USA brands. No more worrying about fakes or paying double the price. The authenticity check process gave me so much peace of mind.",
        author: "Daw Nan Khin",
        location: "Yangon",
        role: "Verified Buyer",
        rating: 5,
        isActive: true
      },
      {
        text: "The delivery is incredibly fast. I ordered a Coach bag on Tuesday and it arrived by Wednesday afternoon in Mandalay. Excellent service and the packaging was beautiful.",
        author: "Ko Min Thu",
        location: "Mandalay",
        role: "Platinum Member",
        rating: 5,
        isActive: true
      },
      {
        text: "Fair prices and genuine items. It's hard to find a trustworthy shop like this in Myanmar. I've recommended Amber to all my friends who love Nike and Adidas.",
        author: "Ma Thiri",
        location: "Naypyidaw",
        role: "Verified Buyer",
        rating: 5,
        isActive: true
      }
    ]
  });

  await prisma.communityPost.deleteMany();
  await prisma.communityPost.createMany({
    data: [
      {
        user: "Su Myat",
        handle: "@sumyat_fashion",
        comment: "The quality of the silk is amazing. It feels so premium and fits perfectly!",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
        stars: 5,
        likes: 124,
        isActive: true
      },
      {
        user: "Khin Wint Wah",
        handle: "@khin_wint_style",
        comment: "Amber Brand has captured the essence of modern Myanmar. I love my new longyi!",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
        stars: 5,
        likes: 89,
        isActive: true
      },
      {
        user: "Thandar",
        handle: "@thandar_official",
        comment: "Elegant, chic, and cultural. This is exactly what I've been looking for.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
        stars: 5,
        likes: 210,
        isActive: true
      },
      {
        user: "Phyu Phyu",
        handle: "@phyu_styles",
        comment: "Best shopping experience in Yangon. Quick delivery and beautiful packaging.",
        image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop",
        stars: 4,
        likes: 56,
        isActive: true
      }
    ]
  });

  // Add a variant with barcode
  await prisma.variant.upsert({
    where: { sku: 'COA-TOTE-BRN-01' },
    update: {},
    create: {
      sku: 'COA-TOTE-BRN-01',
      barcode: '8801234567890',
      size: 'OS',
      color: 'Brown/Tan',
      stock: 10,
      lowStockThreshold: 2,
      weight: 1.2,
      productId: tote.id
    }
  });

  const thingyanSale = await prisma.collection.upsert({
    where: { slug: 'thingyan-sale' },
    update: {},
    create: {
      name: 'Thingyan Sale',
      slug: 'thingyan-sale',
      description: 'Celebrate Myanmar New Year with massive savings on USA authentic brands.',
      isActive: true,
    }
  });

  const discountedTee = await prisma.product.upsert({
    where: { slug: 'nike-classic-tee-sale' },
    update: {},
    create: {
      name: 'Nike Classic Sport Tee',
      slug: 'nike-classic-tee-sale',
      status: ProductStatus.PUBLISHED,
      brandId: nikeBrand.id,
      price: 25.00,
      compareAtPrice: 45.00,
      onSale: true,
      categoryId: apparel.id,
      images: ['https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5b6a1bb1-1c67-4fe8-b71d-f8cf30e636a2/AS+W+NSW+CLASSIC+SS+TEE.png'],
      collections: {
        connect: [{ id: thingyanSale.id }]
      }
    }
  });

  // Add Payment Methods
  const paymentMethods = [
    {
      name: 'KBZPay',
      type: 'MANUAL',
      accountName: 'AMBER CO., LTD',
      accountNumber: '09123456789',
      instructions: 'Please send a screenshot of your payment to our Facebook page or Viber.',
      isActive: true,
    },
    {
      name: 'WavePay',
      type: 'MANUAL',
      accountName: 'AMBER CO., LTD',
      accountNumber: '09123456789',
      instructions: 'Please send a screenshot of your payment to our Facebook page or Viber.',
      isActive: true,
    },
    {
      name: 'Credit Card',
      type: 'STRIPE',
      instructions: 'Secure payment via Stripe. Supported cards: Visa, Mastercard, AMEX.',
      isActive: true,
    },
    {
      name: 'Cash on Delivery',
      type: 'MANUAL',
      instructions: 'Pay with cash upon delivery.',
      isActive: true,
    },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: pm,
      create: pm,
    });
  }

  console.log('Payment Methods created');

  console.log('Seed completed with Thingyan Sale data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
