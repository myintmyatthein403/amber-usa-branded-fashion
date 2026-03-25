-- CreateTable
CREATE TABLE "MissionSection" (
    "id" TEXT NOT NULL,
    "badge" TEXT DEFAULT 'Our Mission',
    "title" TEXT NOT NULL,
    "titleItalic" TEXT,
    "description" TEXT NOT NULL,
    "descriptionSecondary" TEXT,
    "featureOneTitle" TEXT,
    "featureOneDescription" TEXT,
    "featureTwoTitle" TEXT,
    "featureTwoDescription" TEXT,
    "trustBadgeText" TEXT,
    "imageMain" TEXT NOT NULL,
    "imageSecondary" TEXT,
    "ctaText" TEXT DEFAULT 'Shop All Authentic Brands',
    "ctaLink" TEXT DEFAULT '/shop',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionSection_pkey" PRIMARY KEY ("id")
);
