-- CreateTable
CREATE TABLE "FooterSection" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Amber',
    "companySubtitle" TEXT NOT NULL DEFAULT 'Premium USA Brands',
    "companyDescription" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "contactAddress" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "copyrightText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSection_pkey" PRIMARY KEY ("id")
);
