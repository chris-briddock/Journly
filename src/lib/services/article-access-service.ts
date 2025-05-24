import prisma from '@/lib/prisma';
import { startOfMonth } from 'date-fns';
import { hasActiveSubscription } from './subscription-service';

// Check if a user can access an article
export async function canAccessArticle(userId: string | null, postId: string): Promise<boolean> {
  // If no user is logged in, they cannot access any article
  if (!userId) {
    return false;
  }

  // Check if the user has an active subscription
  const hasSubscription = await hasActiveSubscription(userId);

  // If the user has an active subscription, they can access any article
  if (hasSubscription) {
    return true;
  }

  // For free users, check if they have reached their monthly limit
  const userResult = await prisma.$queryRaw<Array<{
    articlesReadThisMonth: number,
    monthlyArticleLimit: number,
    lastArticleResetDate: Date | null
  }>>`
    SELECT "articlesReadThisMonth", "monthlyArticleLimit", "lastArticleResetDate"
    FROM "User" WHERE id = ${userId}
  `;

  if (!userResult || userResult.length === 0) {
    return false;
  }

  const user = userResult[0];

  // Check if we need to reset the monthly counter
  const startOfCurrentMonth = startOfMonth(new Date());
  if (!user.lastArticleResetDate || user.lastArticleResetDate < startOfCurrentMonth) {
    // Reset the counter
    await prisma.$executeRaw`
      UPDATE "User"
      SET "articlesReadThisMonth" = 0, "lastArticleResetDate" = NOW()
      WHERE id = ${userId}
    `;

    // User can access the article (it will be their first this month)
    return true;
  }

  // Check if the user has already accessed this article
  const existingAccess = await prisma.$queryRaw`
    SELECT id FROM "ArticleAccess"
    WHERE "userId" = ${userId} AND "postId" = ${postId}
    LIMIT 1
  `;

  // If the user has already accessed this article, they can access it again
  if (existingAccess && Array.isArray(existingAccess) && existingAccess.length > 0) {
    return true;
  }

  // Check if the user has reached their monthly limit
  return (user.articlesReadThisMonth || 0) < (user.monthlyArticleLimit || 5);
}

// Record that a user has accessed an article
export async function recordArticleAccess(userId: string, postId: string): Promise<void> {
  console.log(`[Service] Recording article access for user: ${userId}, post: ${postId}`);

  // Check if the user has already accessed this article
  const existingAccess = await prisma.$queryRaw`
    SELECT id FROM "ArticleAccess"
    WHERE "userId" = ${userId} AND "postId" = ${postId}
    LIMIT 1
  `;

  console.log(`[Service] Existing access: ${JSON.stringify(existingAccess)}`);

  // If the user has already accessed this article, update the access time
  if (existingAccess && Array.isArray(existingAccess) && existingAccess.length > 0) {
    console.log(`[Service] Updating existing access record`);
    await prisma.$executeRaw`
      UPDATE "ArticleAccess"
      SET "accessedAt" = NOW()
      WHERE "userId" = ${userId} AND "postId" = ${postId}
    `;
    console.log(`[Service] Access record updated`);
    return;
  }

  // Create a new access record
  console.log(`[Service] Creating new access record`);
  await prisma.$executeRaw`
    INSERT INTO "ArticleAccess" ("id", "userId", "postId", "accessedAt")
    VALUES (gen_random_uuid(), ${userId}, ${postId}, NOW())
  `;
  console.log(`[Service] Access record created`);

  // Increment the user's monthly article count
  console.log(`[Service] Incrementing monthly article count`);
  await prisma.$executeRaw`
    UPDATE "User"
    SET "articlesReadThisMonth" = "articlesReadThisMonth" + 1
    WHERE id = ${userId}
  `;
  console.log(`[Service] Monthly article count incremented`);
}

// Get the number of articles a user has read this month
export async function getArticlesReadThisMonth(userId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ articlesReadThisMonth: number }>>`
    SELECT "articlesReadThisMonth" FROM "User" WHERE id = ${userId}
  `;

  return result && result.length > 0 ? result[0].articlesReadThisMonth : 0;
}

// Get the user's monthly article limit
export async function getMonthlyArticleLimit(userId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ monthlyArticleLimit: number }>>`
    SELECT "monthlyArticleLimit" FROM "User" WHERE id = ${userId}
  `;

  return result && result.length > 0 ? result[0].monthlyArticleLimit : 5;
}

// Reset a user's article count
export async function resetUserArticleLimit(userId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "User"
    SET "articlesReadThisMonth" = 0, "lastArticleResetDate" = NOW()
    WHERE id = ${userId}
  `;
}

// Reset all users' article counts
export async function resetAllUserArticleLimits(): Promise<{ count: number }> {
  // Only reset for users with FREE subscriptions
  const result = await prisma.$executeRaw`
    UPDATE "User" u
    SET "articlesReadThisMonth" = 0, "lastArticleResetDate" = NOW()
    FROM "Subscription" s
    WHERE u.id = s.userId AND s.tier = 'FREE'
  `;

  // Also reset for users without any subscription
  const result2 = await prisma.$executeRaw`
    UPDATE "User" u
    SET "articlesReadThisMonth" = 0, "lastArticleResetDate" = NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM "Subscription" s WHERE s.userId = u.id
    )
  `;

  return { count: Number(result) + Number(result2) };
}
