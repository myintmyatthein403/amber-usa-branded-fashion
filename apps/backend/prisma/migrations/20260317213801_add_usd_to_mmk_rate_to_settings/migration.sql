-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isUsdPrice" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "usdToMmkRate" DECIMAL(10,2) NOT NULL DEFAULT 3500.00;
