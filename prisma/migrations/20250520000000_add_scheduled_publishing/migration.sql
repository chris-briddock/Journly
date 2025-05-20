-- AlterTable
ALTER TABLE "Post" ADD COLUMN "scheduledPublishAt" TIMESTAMP(3);

-- Update the status enum comment to include scheduled
COMMENT ON COLUMN "Post"."status" IS 'draft, published, scheduled';
