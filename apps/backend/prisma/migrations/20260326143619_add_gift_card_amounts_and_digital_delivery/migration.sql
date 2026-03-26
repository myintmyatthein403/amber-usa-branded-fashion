-- AlterTable
ALTER TABLE "DeliveryMethod" ADD COLUMN     "isDigital" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GiftCardSection" ADD COLUMN     "amounts" TEXT[] DEFAULT ARRAY['50,000 MMK', '100,000 MMK', '200,000 MMK', '500,000 MMK']::TEXT[];
