import prisma from '@/lib/prisma';
import { addMonths } from 'date-fns';
import {
  createStripeCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  ensurePriceExists
} from '@/lib/stripe';
import { SubscriptionStatus, SubscriptionTier } from '@/lib/types';

// Create a free subscription for a new user
export async function createFreeSubscription(userId: string) {
  const oneMonthFromNow = addMonths(new Date(), 1);

  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "Subscription" (
      id,
      "userId",
      tier,
      status,
      "currentPeriodStart",
      "currentPeriodEnd",
      "cancelAtPeriodEnd",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      ${userId},
      ${SubscriptionTier.FREE}::"SubscriptionTier",
      ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus",
      NOW(),
      ${oneMonthFromNow},
      false,
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  return result[0];
}

// Create a paid subscription
export async function createPaidSubscription(
  userId: string,
  paymentMethodId: string,
  customerEmail: string,
  customerName?: string
) {
  // Get the user's subscription
  const existingSubscription = await getUserSubscription(userId);

  // Create or retrieve Stripe customer
  let stripeCustomerId = existingSubscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    stripeCustomerId = await createStripeCustomer(customerEmail, customerName);
  }

  // Ensure we have a valid price ID
  const priceId = await ensurePriceExists();

  // Create the subscription in Stripe
  const stripeSubscription = await createSubscription(
    stripeCustomerId,
    priceId,
    paymentMethodId
  );

  // Calculate the current period end date
  const stripeData = stripeSubscription as unknown as { current_period_end: number, id: string };
  const currentPeriodEnd = new Date(stripeData.current_period_end * 1000);

  // Create or update the subscription in the database
  if (existingSubscription) {
    // Update existing subscription
    await prisma.$executeRaw`
      UPDATE "Subscription"
      SET
        tier = ${SubscriptionTier.MEMBER}::"SubscriptionTier",
        status = ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus",
        "stripeCustomerId" = ${stripeCustomerId},
        "stripeSubscriptionId" = ${stripeData.id},
        "currentPeriodEnd" = ${currentPeriodEnd},
        "cancelAtPeriodEnd" = false,
        "updatedAt" = NOW()
      WHERE id = ${existingSubscription.id}
    `;

    // Update user's monthly article limit to a very high number (effectively unlimited)
    await prisma.$executeRaw`
      UPDATE "User"
      SET "monthlyArticleLimit" = 999999
      WHERE id = ${userId}
    `;

    return {
      ...existingSubscription,
      tier: SubscriptionTier.MEMBER,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId,
      stripeSubscriptionId: stripeData.id,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: new Date()
    };
  } else {
    // Create new subscription
    const result = await prisma.$queryRaw<Array<{
      id: string;
      userId: string;
      tier: string;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      INSERT INTO "Subscription" (
        id,
        "userId",
        tier,
        status,
        "currentPeriodStart",
        "currentPeriodEnd",
        "cancelAtPeriodEnd",
        "stripeCustomerId",
        "stripeSubscriptionId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${SubscriptionTier.MEMBER}::"SubscriptionTier",
        ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus",
        NOW(),
        ${currentPeriodEnd},
        false,
        ${stripeCustomerId},
        ${stripeData.id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Update user's monthly article limit to a very high number (effectively unlimited)
    await prisma.$executeRaw`
      UPDATE "User"
      SET "monthlyArticleLimit" = 999999
      WHERE id = ${userId}
    `;

    return result[0];
  }
}

// Cancel a subscription
export async function cancelUserSubscription(userId: string) {
  // Get the user's subscription
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // If it's a Stripe subscription, cancel it in Stripe
  if (subscription.stripeSubscriptionId) {
    await cancelSubscription(subscription.stripeSubscriptionId);
  }

  // Update the subscription in the database
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${SubscriptionStatus.CANCELED}::"SubscriptionStatus",
      "cancelAtPeriodEnd" = true,
      "updatedAt" = NOW()
    WHERE id = ${subscription.id}
  `;

  // Note: We don't reset the monthly article limit immediately
  // The user should still have access until the end of their billing period
  // We'll reset it when the subscription actually ends

  // Return the updated subscription
  return {
    ...subscription,
    status: SubscriptionStatus.CANCELED,
    cancelAtPeriodEnd: true,
    updatedAt: new Date()
  };
}

// Check if a user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  console.log(`[Subscription] Checking if user ${userId} has an active subscription`);

  const subscriptions = await prisma.$queryRaw<Array<{ status: string, tier: string, currentPeriodEnd: Date }>>`
    SELECT status, tier, "currentPeriodEnd" FROM "Subscription"
    WHERE "userId" = ${userId}
  `;

  console.log(`[Subscription] Found ${subscriptions?.length || 0} subscriptions for user ${userId}`);

  if (!subscriptions || subscriptions.length === 0) {
    console.log(`[Subscription] No subscriptions found for user ${userId}`);
    return false;
  }

  const subscription = subscriptions[0];
  console.log(`[Subscription] User ${userId} has subscription: status=${subscription.status}, tier=${subscription.tier}, currentPeriodEnd=${subscription.currentPeriodEnd}`);

  // Check if the subscription is a paid tier and still valid
  const isPaidTier = subscription.tier === SubscriptionTier.MEMBER;
  const isStillValid = new Date(subscription.currentPeriodEnd) > new Date();

  // A subscription is considered active if:
  // 1. It's a paid tier (MEMBER)
  // 2. It's either ACTIVE or CANCELED but still within the billing period
  const isActive = isPaidTier && (
    subscription.status === SubscriptionStatus.ACTIVE ||
    (subscription.status === SubscriptionStatus.CANCELED && isStillValid)
  );

  console.log(`[Subscription] User ${userId} subscription analysis: isPaidTier=${isPaidTier}, isStillValid=${isStillValid}, status=${subscription.status}`);
  console.log(`[Subscription] User ${userId} has ${isActive ? 'an active' : 'an inactive'} subscription`);
  return isActive;
}

// Get a user's subscription
export async function getUserSubscription(userId: string) {
  const subscriptions = await prisma.$queryRaw<Array<{
    id: string;
    userId: string;
    tier: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>>`
    SELECT * FROM "Subscription"
    WHERE "userId" = ${userId}
    LIMIT 1
  `;

  return subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
}

// Sync a subscription with Stripe
export async function syncSubscriptionWithStripe(userId: string) {
  // Get the user's subscription
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.stripeSubscriptionId) {
    return null;
  }

  // Get the subscription from Stripe
  const stripeSubscription = await getSubscription(subscription.stripeSubscriptionId);

  // Calculate the current period end date
  const stripeData = stripeSubscription as unknown as { current_period_end: number };
  const currentPeriodEnd = new Date(stripeData.current_period_end * 1000);

  // Map Stripe status to our status
  let status: SubscriptionStatus;
  switch (stripeSubscription.status) {
    case 'active':
      status = SubscriptionStatus.ACTIVE;
      break;
    case 'past_due':
      status = SubscriptionStatus.PAST_DUE;
      break;
    case 'canceled':
      status = SubscriptionStatus.CANCELED;
      break;
    case 'incomplete':
      status = SubscriptionStatus.INCOMPLETE;
      break;
    case 'incomplete_expired':
      status = SubscriptionStatus.INCOMPLETE_EXPIRED;
      break;
    case 'trialing':
      status = SubscriptionStatus.TRIALING;
      break;
    case 'unpaid':
      status = SubscriptionStatus.UNPAID;
      break;
    default:
      status = SubscriptionStatus.CANCELED;
  }

  // Check if the subscription has ended
  const hasEnded = status === SubscriptionStatus.CANCELED &&
                  new Date() > new Date(subscription.currentPeriodEnd);

  // If the subscription has ended, reset the user's monthly article limit
  if (hasEnded) {
    await resetUserArticleLimit(userId);
  }

  // Update the subscription in the database
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${status}::"SubscriptionStatus",
      "currentPeriodEnd" = ${currentPeriodEnd},
      "cancelAtPeriodEnd" = ${stripeSubscription.cancel_at_period_end},
      "updatedAt" = NOW()
    WHERE id = ${subscription.id}
  `;

  // Return the updated subscription
  return {
    ...subscription,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    updatedAt: new Date()
  };
}

// Reset a user's monthly article limit to the default (5)
export async function resetUserArticleLimit(userId: string) {
  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "monthlyArticleLimit" = 5,
      "articlesReadThisMonth" = 0,
      "lastArticleResetDate" = NOW()
    WHERE id = ${userId}
  `;
}

// Check if a user can create a post (free users are limited to 1 post)
export async function canCreatePost(userId: string): Promise<boolean> {
  console.log(`[PostLimit] Checking if user ${userId} can create a post`);

  // Get the user's subscription directly
  const subscriptions = await prisma.$queryRaw<Array<{ tier: string, status: string, currentPeriodEnd: Date }>>`
    SELECT tier, status, "currentPeriodEnd" FROM "Subscription"
    WHERE "userId" = ${userId}
  `;

  console.log(`[PostLimit] Found ${subscriptions?.length || 0} subscriptions for user ${userId}`);

  // Check if the user has an active paid subscription (including cancelled but still valid)
  if (subscriptions && subscriptions.length > 0) {
    const subscription = subscriptions[0];
    const isPaidTier = subscription.tier === SubscriptionTier.MEMBER;
    const isStillValid = new Date(subscription.currentPeriodEnd) > new Date();

    const hasActivePaidSubscription = isPaidTier && (
      subscription.status === SubscriptionStatus.ACTIVE ||
      (subscription.status === SubscriptionStatus.CANCELED && isStillValid)
    );

    console.log(`[PostLimit] User ${userId} subscription: tier=${subscription.tier}, status=${subscription.status}, isStillValid=${isStillValid}, hasActivePaidSubscription=${hasActivePaidSubscription}`);

    if (hasActivePaidSubscription) {
      console.log(`[PostLimit] User ${userId} has an active paid subscription, allowing unlimited posts`);
      return true;
    }
  }

  // For free users, check if they already have a post
  const postCount = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count FROM "Post"
    WHERE "authorId" = ${userId}
  `;

  console.log(`[PostLimit] User ${userId} has ${postCount[0].count} posts`);

  // Free users can only create 1 post
  const canCreate = postCount[0].count < 1;
  console.log(`[PostLimit] User ${userId} can create a post: ${canCreate}`);
  return canCreate;
}
