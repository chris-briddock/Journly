/*
  Warnings:

  - Added the required column `updatedAt` to the `ReadingHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReadingHistory" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ReadingHistory_userId_idx" ON "ReadingHistory"("userId");

-- CreateIndex
CREATE INDEX "ReadingHistory_postId_idx" ON "ReadingHistory"("postId");

-- CreateIndex
CREATE INDEX "ReadingHistory_lastRead_idx" ON "ReadingHistory"("lastRead");
