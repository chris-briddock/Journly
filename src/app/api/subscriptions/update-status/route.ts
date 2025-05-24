import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/subscriptions/update-status - Update a user's subscription status
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, tier, monthlyArticleLimit } = await req.json();

    // Only allow users to update their own subscription or admins
    if (userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update this user\'s subscription' },
        { status: 403 }
      );
    }

    // Update the user's monthly post limit if provided
    if (monthlyArticleLimit !== undefined) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "monthlyArticleLimit" = ${monthlyArticleLimit}
        WHERE id = ${userId}
      `;
    }

    // Get the user's subscription
    const subscriptions = await prisma.$queryRaw<Array<{
      id: string;
      tier: string;
    }>>`
      SELECT id, tier FROM "Subscription"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;

    // If the user has a subscription and tier is provided, update it
    if (subscriptions && subscriptions.length > 0 && tier) {
      const subscription = subscriptions[0];
      
      await prisma.$executeRaw`
        UPDATE "Subscription"
        SET tier = ${tier}::"SubscriptionTier"
        WHERE id = ${subscription.id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription updated successfully' 
      });
    } else if (tier) {
      // If the user doesn't have a subscription but tier is provided, create one
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      await prisma.$executeRaw`
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
          ${tier}::"SubscriptionTier",
          'ACTIVE'::"SubscriptionStatus",
          NOW(),
          ${oneMonthFromNow},
          false,
          NOW(),
          NOW()
        )
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription created successfully' 
      });
    } else if (monthlyArticleLimit !== undefined) {
      // If only the monthly article limit was updated
      return NextResponse.json({ 
        success: true, 
        message: 'Monthly article limit updated successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    );
  }
}
