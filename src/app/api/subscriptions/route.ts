import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createFreeSubscription,
  createPaidSubscription,
  getUserSubscription,
  cancelUserSubscription
} from '@/lib/services/subscription-service';
import prisma from '@/lib/prisma';

// GET /api/subscriptions - Get the current user's subscription
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(session.user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create a new subscription
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { paymentMethodId, tier } = body;

    // Get the user's email and name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let subscription;

    if (tier === 'FREE') {
      subscription = await createFreeSubscription(session.user.id);
    } else if (tier === 'MEMBER') {
      if (!paymentMethodId) {
        return NextResponse.json(
          { error: 'Payment method ID is required for paid subscriptions' },
          { status: 400 }
        );
      }

      subscription = await createPaidSubscription(
        session.user.id,
        paymentMethodId,
        user.email,
        user.name || undefined
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Cancel the current user's subscription
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await cancelUserSubscription(session.user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
