import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createCheckoutSession, stripe, ensurePriceExists } from '@/lib/stripe';
import { UserWithSubscription } from '@/lib/types';

// Force Node.js runtime for Stripe compatibility
export const runtime = 'nodejs';

// POST /api/subscriptions/checkout - Create a checkout session for a subscription
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user and their subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    }) as UserWithSubscription;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { successUrl, cancelUrl } = body;

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success URL and cancel URL are required' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });

      stripeCustomerId = customer.id;

      // If the user already has a subscription, update it with the Stripe customer ID
      if (user.subscription) {
        await prisma.$executeRaw`
          UPDATE "Subscription"
          SET "stripeCustomerId" = ${stripeCustomerId}, "updatedAt" = NOW()
          WHERE id = ${user.subscription.id}
        `;
      }
    }

    // Ensure we have a valid price ID
    const priceId = await ensurePriceExists();

    // Create a checkout session
    const checkoutUrl = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
