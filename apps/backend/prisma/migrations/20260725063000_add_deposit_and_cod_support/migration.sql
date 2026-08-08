-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN "isCod" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "codDepositAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "depositAmount" DECIMAL(10,2),
ADD COLUMN "balanceDue" DECIMAL(10,2),
ADD COLUMN "balanceSettledAt" TIMESTAMP(3),
ADD COLUMN "balanceSettledBy" TEXT;
