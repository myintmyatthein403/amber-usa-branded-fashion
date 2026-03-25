-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isUsd" BOOLEAN NOT NULL DEFAULT true;
