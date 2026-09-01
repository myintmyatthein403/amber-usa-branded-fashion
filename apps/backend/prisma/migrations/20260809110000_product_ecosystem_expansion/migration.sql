-- Product-system ecosystem expansion: coupon redemption, real customer
-- reviews + verified purchase, product Q&A, wholesale/tiered pricing,
-- per-currency price overrides, product status audit trail, serial-number
-- tracking, and admin-curatable recommendations. Purely additive.

-- ===== Coupons: scoping, BOGO, redemption tracking =====

ALTER TYPE "DiscountType" ADD VALUE 'BUY_X_GET_Y';
ALTER TYPE "DiscountType" ADD VALUE 'FREE_SHIPPING';

CREATE TYPE "CouponScopeType" AS ENUM ('ORDER', 'PRODUCT', 'CATEGORY');

ALTER TABLE "Coupon" ADD COLUMN "scopeType" "CouponScopeType" NOT NULL DEFAULT 'ORDER';
ALTER TABLE "Coupon" ADD COLUMN "scopeProductId" TEXT;
ALTER TABLE "Coupon" ADD COLUMN "scopeCategoryId" TEXT;
ALTER TABLE "Coupon" ADD COLUMN "buyQuantity" INTEGER;
ALTER TABLE "Coupon" ADD COLUMN "getQuantity" INTEGER;

CREATE INDEX "Coupon_scopeProductId_idx" ON "Coupon"("scopeProductId");
CREATE INDEX "Coupon_scopeCategoryId_idx" ON "Coupon"("scopeCategoryId");

ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_scopeProductId_fkey" FOREIGN KEY ("scopeProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_scopeCategoryId_fkey" FOREIGN KEY ("scopeCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountAmount" DECIMAL(10,2);

CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CouponRedemption_orderId_key" ON "CouponRedemption"("orderId");
CREATE INDEX "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");
CREATE INDEX "CouponRedemption_userId_idx" ON "CouponRedemption"("userId");

ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== Reviews: real customer submissions + verified purchase, rating aggregate =====

ALTER TABLE "Product" ADD COLUMN "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "warrantyMonths" INTEGER;
ALTER TABLE "Product" ADD COLUMN "returnWindowDaysOverride" INTEGER;

ALTER TABLE "Review" ADD COLUMN "userId" TEXT;
ALTER TABLE "Review" ADD COLUMN "orderItemId" TEXT;
ALTER TABLE "Review" ADD COLUMN "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_orderItemId_idx" ON "Review"("orderItemId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== Product status workflow: IN_REVIEW + audit trail =====

ALTER TYPE "ProductStatus" ADD VALUE 'IN_REVIEW';

CREATE TABLE "ProductStatusHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fromStatus" "ProductStatus",
    "toStatus" "ProductStatus" NOT NULL,
    "changedBy" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductStatusHistory_productId_idx" ON "ProductStatusHistory"("productId");

ALTER TABLE "ProductStatusHistory" ADD CONSTRAINT "ProductStatusHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Category: return-policy override =====

ALTER TABLE "Category" ADD COLUMN "returnWindowDaysOverride" INTEGER;

-- ===== Product Q&A =====

CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "body" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "answeredBy" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_productId_idx" ON "Question"("productId");
CREATE INDEX "Question_userId_idx" ON "Question"("userId");
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

ALTER TABLE "Question" ADD CONSTRAINT "Question_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Media/DAM usage tracking =====

CREATE TABLE "MediaUsage" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaUsage_mediaId_idx" ON "MediaUsage"("mediaId");
CREATE INDEX "MediaUsage_productId_idx" ON "MediaUsage"("productId");
CREATE INDEX "MediaUsage_variantId_idx" ON "MediaUsage"("variantId");

ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Wholesale / tiered pricing =====

CREATE TABLE "PriceTier" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "minQuantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PriceTier_productId_idx" ON "PriceTier"("productId");
CREATE INDEX "PriceTier_variantId_idx" ON "PriceTier"("variantId");

ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceTier" ADD CONSTRAINT "PriceTier_variant_xor_product" CHECK (
  ("variantId" IS NOT NULL AND "productId" IS NULL) OR ("variantId" IS NULL AND "productId" IS NOT NULL)
);

-- ===== True multi-currency product pricing =====

CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "currencyCode" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductPrice_productId_currencyCode_key" ON "ProductPrice"("productId", "currencyCode");
CREATE UNIQUE INDEX "ProductPrice_variantId_currencyCode_key" ON "ProductPrice"("variantId", "currencyCode");

ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_variant_xor_product" CHECK (
  ("variantId" IS NOT NULL AND "productId" IS NULL) OR ("variantId" IS NULL AND "productId" IS NOT NULL)
);

-- ===== Serial number / warranty unit tracking =====

ALTER TABLE "Variant" ADD COLUMN "tracksSerialNumbers" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "SerialStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RETURNED');

CREATE TABLE "SerialNumber" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "SerialStatus" NOT NULL DEFAULT 'AVAILABLE',
    "orderItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SerialNumber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SerialNumber_serialNumber_key" ON "SerialNumber"("serialNumber");
CREATE INDEX "SerialNumber_variantId_idx" ON "SerialNumber"("variantId");
CREATE INDEX "SerialNumber_orderItemId_idx" ON "SerialNumber"("orderItemId");

ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== Recommendations (admin-curated overrides) =====

CREATE TYPE "RecommendationType" AS ENUM ('RELATED', 'FREQUENTLY_BOUGHT_TOGETHER');

CREATE TABLE "ProductRecommendation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "recommendedProductId" TEXT NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductRecommendation_productId_recommendedProductId_type_key" ON "ProductRecommendation"("productId", "recommendedProductId", "type");
CREATE INDEX "ProductRecommendation_productId_idx" ON "ProductRecommendation"("productId");

ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_recommendedProductId_fkey" FOREIGN KEY ("recommendedProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
