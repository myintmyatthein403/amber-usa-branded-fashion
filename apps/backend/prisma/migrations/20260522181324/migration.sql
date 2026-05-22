/*
  Warnings:

  - You are about to drop the column `usdToMmkRate` on the `Settings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('USA', 'MYANMAR', 'BOTH', 'PRE_ORDER_ONLY');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "visibility" "ProductVisibility" NOT NULL DEFAULT 'BOTH';

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "usdToMmkRate";
