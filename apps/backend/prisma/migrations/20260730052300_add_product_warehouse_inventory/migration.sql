-- AlterTable: Product gets a low-stock threshold, mirroring Variant.lowStockThreshold
ALTER TABLE "Product" ADD COLUMN "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;

-- AlterTable: Inventory.variantId becomes optional, add optional productId
ALTER TABLE "Inventory" ALTER COLUMN "variantId" DROP NOT NULL;
ALTER TABLE "Inventory" ADD COLUMN "productId" TEXT;

-- AlterTable: StockMovement.variantId becomes optional, add optional productId
ALTER TABLE "StockMovement" ALTER COLUMN "variantId" DROP NOT NULL;
ALTER TABLE "StockMovement" ADD COLUMN "productId" TEXT;

-- AlterTable: CargoItem.variantId becomes optional, add optional productId
ALTER TABLE "CargoItem" ALTER COLUMN "variantId" DROP NOT NULL;
ALTER TABLE "CargoItem" ADD COLUMN "productId" TEXT;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CargoItem" ADD CONSTRAINT "CargoItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddIndex: parallel unique constraint for productId+warehouseId (NULL-safe alongside the existing variantId+warehouseId unique index)
CREATE UNIQUE INDEX "Inventory_productId_warehouseId_key" ON "Inventory"("productId", "warehouseId");

-- Exactly one of variantId/productId must be set on each row (satisfied by every existing row, which already has variantId set and productId null)
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variant_xor_product" CHECK (
  ("variantId" IS NOT NULL AND "productId" IS NULL) OR ("variantId" IS NULL AND "productId" IS NOT NULL)
);
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variant_xor_product" CHECK (
  ("variantId" IS NOT NULL AND "productId" IS NULL) OR ("variantId" IS NULL AND "productId" IS NOT NULL)
);
ALTER TABLE "CargoItem" ADD CONSTRAINT "CargoItem_variant_xor_product" CHECK (
  ("variantId" IS NOT NULL AND "productId" IS NULL) OR ("variantId" IS NULL AND "productId" IS NOT NULL)
);
