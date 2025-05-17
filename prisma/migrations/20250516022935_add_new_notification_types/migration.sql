-- AlterTable
ALTER TABLE "UserNotificationPreferences" ADD COLUMN     "mentionsInComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mentionsInPosts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newPostsFromFollowing" BOOLEAN NOT NULL DEFAULT true;
