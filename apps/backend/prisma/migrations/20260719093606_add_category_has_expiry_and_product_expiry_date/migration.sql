-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "hasExpiry" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiryDate" TIMESTAMP(3);
