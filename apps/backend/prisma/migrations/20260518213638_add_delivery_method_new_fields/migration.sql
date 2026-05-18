-- AlterTable
ALTER TABLE "DeliveryMethod" ADD COLUMN     "locationPrices" JSONB,
ADD COLUMN     "logoLink" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "HeroSection" ALTER COLUMN "imageMain" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SaleSection" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "imageMain" DROP NOT NULL;
