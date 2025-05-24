-- Add subscription tier enum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'MEMBER');

-- Add subscription status enum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'UNPAID');

-- Add subscription model
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Add payment model
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Add article access model to track free user article views
CREATE TABLE "ArticleAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ArticleAccess_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint to Subscription userId
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- Add unique constraint to ArticleAccess userId and postId
CREATE UNIQUE INDEX "ArticleAccess_userId_postId_key" ON "ArticleAccess"("userId", "postId");

-- Add foreign key constraints
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleAccess" ADD CONSTRAINT "ArticleAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleAccess" ADD CONSTRAINT "ArticleAccess_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add isPremium field to Post model
ALTER TABLE "Post" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- Add monthlyArticleLimit field to User model
ALTER TABLE "User" ADD COLUMN "monthlyArticleLimit" INTEGER NOT NULL DEFAULT 5;

-- Add lastArticleResetDate field to User model
ALTER TABLE "User" ADD COLUMN "lastArticleResetDate" TIMESTAMP(3);

-- Add articlesReadThisMonth field to User model
ALTER TABLE "User" ADD COLUMN "articlesReadThisMonth" INTEGER NOT NULL DEFAULT 0;
