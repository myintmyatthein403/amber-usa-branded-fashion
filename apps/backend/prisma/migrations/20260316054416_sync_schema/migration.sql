-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "detail" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "images" TEXT[];
