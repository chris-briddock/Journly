import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { SubscriptionStatus, SubscriptionTier } from '@/lib/types';

// Force Node.js runtime for Stripe compatibility
export const runtime = 'nodejs';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get the raw body from the request (not used, but kept for reference)
// async function getRawBody(req: NextRequest): Promise<string> {
//   const chunks = [];
//   for await (const chunk of req.body as any) {
//     chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
//   }
//   return Buffer.concat(chunks).toString('utf8');
// }

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as unknown as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as unknown as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as unknown as Record<string, unknown>);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as unknown as Record<string, unknown>);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to handle webhook' },
      { status: 500 }
    );
  }
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find the subscription in the database by Stripe subscription ID
  const dbSubscription = await prisma.$queryRaw<Array<{ id: string, userId: string }>>`
    SELECT id, "userId" FROM "Subscription" WHERE "stripeSubscriptionId" = ${subscription.id}
  `;

  if (!dbSubscription || dbSubscription.length === 0) {
    console.log(`Subscription not found in database: ${subscription.id}`);
    console.log('This is normal for new subscriptions created via webhook. Skipping update.');
    return;
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus;
  switch (subscription.status) {
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

  // Update the subscription in the database
  const stripeData = subscription as unknown as { current_period_end: number, cancel_at_period_end: boolean };
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${status}::"SubscriptionStatus",
      tier = ${SubscriptionTier.MEMBER}::"SubscriptionTier",
      "currentPeriodEnd" = ${new Date(stripeData.current_period_end * 1000)},
      "cancelAtPeriodEnd" = ${stripeData.cancel_at_period_end},
      "updatedAt" = NOW()
    WHERE id = ${dbSubscription[0].id}
  `;

  // If subscription is active, update the user's monthly article limit to unlimited
  if (status === SubscriptionStatus.ACTIVE) {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "monthlyArticleLimit" = 999999
      WHERE id = ${dbSubscription[0].userId}
    `;
  }
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find the subscription in the database by Stripe subscription ID
  const dbSubscription = await prisma.$queryRaw<Array<{ id: string, userId: string }>>`
    SELECT id, "userId" FROM "Subscription" WHERE "stripeSubscriptionId" = ${subscription.id}
  `;

  if (!dbSubscription || dbSubscription.length === 0) {
    console.log(`Subscription not found in database: ${subscription.id}`);
    console.log('This is normal for new subscriptions created via webhook. Skipping update.');
    return;
  }

  // Update the subscription in the database
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${SubscriptionStatus.CANCELED}::"SubscriptionStatus",
      tier = ${SubscriptionTier.FREE}::"SubscriptionTier",
      "cancelAtPeriodEnd" = true,
      "updatedAt" = NOW()
    WHERE id = ${dbSubscription[0].id}
  `;

  // Reset the user's monthly article limit to the default (5)
  await prisma.$executeRaw`
    UPDATE "User"
    SET "monthlyArticleLimit" = 5
    WHERE id = ${dbSubscription[0].userId}
  `;
}

// Handle invoice payment succeeded event
async function handleInvoicePaymentSucceeded(invoice: Record<string, unknown>) {
  if (!invoice.subscription) {
    return;
  }

  // Find the subscription in the database by Stripe subscription ID
  const dbSubscription = await prisma.$queryRaw<Array<{ id: string, userId: string }>>`
    SELECT id, "userId" FROM "Subscription" WHERE "stripeSubscriptionId" = ${invoice.subscription as string}
  `;

  if (!dbSubscription || dbSubscription.length === 0) {
    console.log(`Subscription not found in database: ${invoice.subscription}`);
    console.log('This is normal for new subscriptions created via webhook. Skipping update.');
    return;
  }

  // Create a payment record
  await prisma.$queryRaw`
    INSERT INTO "Payment" (
      id,
      "userId",
      "subscriptionId",
      amount,
      currency,
      status,
      "stripePaymentIntentId",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      ${dbSubscription[0].userId},
      ${dbSubscription[0].id},
      ${invoice.amount_paid as number},
      ${invoice.currency as string},
      'succeeded',
      ${invoice.payment_intent as string},
      NOW(),
      NOW()
    )
    RETURNING id
  `;

  // Update the subscription status
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus",
      tier = ${SubscriptionTier.MEMBER}::"SubscriptionTier",
      "updatedAt" = NOW()
    WHERE id = ${dbSubscription[0].id}
  `;

  // Update the user's monthly article limit to unlimited
  await prisma.$executeRaw`
    UPDATE "User"
    SET "monthlyArticleLimit" = 999999
    WHERE id = ${dbSubscription[0].userId}
  `;
}

// Handle invoice payment failed event
async function handleInvoicePaymentFailed(invoice: Record<string, unknown>) {
  if (!invoice.subscription) {
    return;
  }

  // Find the subscription in the database by Stripe subscription ID
  const dbSubscription = await prisma.$queryRaw<Array<{ id: string, userId: string }>>`
    SELECT id, "userId" FROM "Subscription" WHERE "stripeSubscriptionId" = ${invoice.subscription as string}
  `;

  if (!dbSubscription || dbSubscription.length === 0) {
    console.log(`Subscription not found in database: ${invoice.subscription}`);
    console.log('This is normal for new subscriptions created via webhook. Skipping update.');
    return;
  }

  // Create a payment record
  await prisma.$queryRaw`
    INSERT INTO "Payment" (
      id,
      "userId",
      "subscriptionId",
      amount,
      currency,
      status,
      "stripePaymentIntentId",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      ${dbSubscription[0].userId},
      ${dbSubscription[0].id},
      ${invoice.amount_due as number},
      ${invoice.currency as string},
      'failed',
      ${invoice.payment_intent as string},
      NOW(),
      NOW()
    )
  `;

  // Update the subscription status
  await prisma.$executeRaw`
    UPDATE "Subscription"
    SET
      status = ${SubscriptionStatus.PAST_DUE}::"SubscriptionStatus",
      "updatedAt" = NOW()
    WHERE id = ${dbSubscription[0].id}
  `;

  // Reset the user's monthly article limit to the default (5) after multiple failed payments
  // We'll check if the subscription has been in PAST_DUE status for more than 3 days
  const subscription = await prisma.$queryRaw<Array<{ updatedAt: Date }>>`
    SELECT "updatedAt" FROM "Subscription" WHERE id = ${dbSubscription[0].id}
  `;

  if (subscription && subscription.length > 0) {
    const lastUpdated = new Date(subscription[0].updatedAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (lastUpdated < threeDaysAgo) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "monthlyArticleLimit" = 5
        WHERE id = ${dbSubscription[0].userId}
      `;
    }
  }
}
