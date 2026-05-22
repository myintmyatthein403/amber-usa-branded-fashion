-- Product variants uplift migration

-- Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "nameMy" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "descriptionMy" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3);
UPDATE "Product" SET "currencyCode" = CASE WHEN "isUsdPrice" = true THEN 'USD' ELSE 'MMK' END;

-- Variant
ALTER TABLE "Variant" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Variant" ADD COLUMN IF NOT EXISTS "attributeSelections" JSONB;
UPDATE "Variant" v SET "currencyCode" = p."currencyCode" FROM "Product" p WHERE v."productId" = p.id;

-- Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lockedExchangeRate" DECIMAL(18,6);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "market" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT;

-- OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "unitPriceUsd" DECIMAL(10,2);
UPDATE "OrderItem" SET "currencyCode" = CASE WHEN "isUsd" = true THEN 'USD' ELSE 'MMK' END;

-- PaymentMethod
ALTER TABLE "PaymentMethod" ADD COLUMN IF NOT EXISTS "markets" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CargoShipment
ALTER TABLE "CargoShipment" ADD COLUMN IF NOT EXISTS "eta" TIMESTAMP(3);
ALTER TABLE "CargoShipment" ADD COLUMN IF NOT EXISTS "customsFee" DECIMAL(10,2);
ALTER TABLE "CargoShipment" ADD COLUMN IF NOT EXISTS "freightCost" DECIMAL(10,2);
ALTER TABLE "CargoShipment" ADD COLUMN IF NOT EXISTS "landedCost" DECIMAL(10,2);
ALTER TABLE "CargoShipment" ADD COLUMN IF NOT EXISTS "documents" JSONB;

-- ExchangeRate
ALTER TABLE "ExchangeRate" ADD COLUMN IF NOT EXISTS "lastFetchedAt" TIMESTAMP(3);
ALTER TABLE "ExchangeRate" ADD COLUMN IF NOT EXISTS "isManualOverride" BOOLEAN NOT NULL DEFAULT false;

-- StockMovementReason enum
DO $$ BEGIN
  CREATE TYPE "StockMovementReason" AS ENUM ('TRANSFER', 'ADJUSTMENT', 'RECEIVING', 'DAMAGE', 'SALE', 'RESTOCK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "quantity" INTEGER NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "note" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "SavedAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "country" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "township" TEXT,
    "zipCode" TEXT,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_variantId_key" ON "WishlistItem"("userId", "productId", "variantId");

ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
