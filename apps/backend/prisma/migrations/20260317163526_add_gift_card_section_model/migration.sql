-- CreateTable
CREATE TABLE "GiftCardSection" (
    "id" TEXT NOT NULL,
    "badge" TEXT DEFAULT 'The Ultimate Gift',
    "title" TEXT NOT NULL,
    "titleSecondary" TEXT,
    "description" TEXT NOT NULL,
    "ctaText" TEXT DEFAULT 'Purchase a Gift Card',
    "ctaLink" TEXT DEFAULT '/gift-cards',
    "cardTitle" TEXT NOT NULL DEFAULT 'Amber',
    "cardAmount" TEXT NOT NULL DEFAULT '100,000 MMK',
    "cardType" TEXT NOT NULL DEFAULT 'Gift Card',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCardSection_pkey" PRIMARY KEY ("id")
);
