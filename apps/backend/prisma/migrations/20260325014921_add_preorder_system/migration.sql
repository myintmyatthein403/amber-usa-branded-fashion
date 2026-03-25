-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "hasPreOrderItems" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "expectedShippingDate" TIMESTAMP(3),
ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preOrderNote" TEXT,
ADD COLUMN     "preOrderShippingDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preOrderShippingDate" TIMESTAMP(3);
