-- Deposit only required for customers with fewer than this many past paid orders; null = disabled
ALTER TABLE "Settings" ADD COLUMN "codDepositOrderThreshold" INTEGER;
