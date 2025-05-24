-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "noIndex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "seoCanonicalUrl" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoKeywords" TEXT,
ADD COLUMN     "seoTitle" TEXT;
