-- CreateTable
CREATE TABLE "SaleSection" (
    "id" TEXT NOT NULL,
    "badge" TEXT DEFAULT 'Limited Time Event',
    "title" TEXT NOT NULL,
    "titleItalic" TEXT,
    "description" TEXT NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "ctaText" TEXT DEFAULT 'Shop the Sale',
    "ctaLink" TEXT DEFAULT '/shop',
    "imageMain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleSection_pkey" PRIMARY KEY ("id")
);
