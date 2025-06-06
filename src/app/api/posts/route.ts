import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateReadingTime } from '@/lib/readingTime';
import { processPostMentions } from '@/lib/mentions';
import { createNewPostNotification } from '@/lib/notifications';
import { SubscriptionTier, SubscriptionStatus } from '@/lib/types';
import { authenticateApiKey } from '@/lib/middleware/api-key-auth';

// Force Node.js runtime for subscription service compatibility
export const runtime = 'nodejs';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status') || 'published';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status };

    // Add search query if provided
    if (query) {
      // PostgreSQL supports case-insensitive search with mode: 'insensitive'
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    let userId: string;

    // Try API key authentication first
    const apiKeyAuth = await authenticateApiKey(request, 'posts:create');

    if (apiKeyAuth.isValid && apiKeyAuth.userId) {
      userId = apiKeyAuth.userId;
      console.log('Creating post with API key authentication for user ID:', userId);
    } else {
      // Fall back to session authentication
      const session = await auth();

      if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
          {
            error: 'Authentication required. Please log in or provide a valid API key.',
            details: apiKeyAuth.error || 'No session found'
          },
          { status: 401 }
        );
      }

      userId = session.user.id;
      console.log('Creating post with session authentication for user ID:', userId);
    }

    // Verify that the user exists in the database
    console.log('Creating post with user ID:', userId);

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error('User not found in database with ID:', userId);
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 404 }
      );
    }

    console.log('User verified in database:', userExists);

    // Check if the user can create a post (free users are limited to 1 post)
    console.log(`[API] Checking if user ${userId} can create a post`);

    // Get the user's subscription directly
    const subscriptions = await prisma.$queryRaw<Array<{ tier: string, status: string, currentPeriodEnd: Date }>>`
      SELECT tier, status, "currentPeriodEnd" FROM "Subscription"
      WHERE "userId" = ${userId}
    `;

    console.log(`[API] Found ${subscriptions?.length || 0} subscriptions for user ${userId}`);

    // Check if the user has an active paid subscription (including cancelled but still valid)
    let hasPaidSubscription = false;
    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const isPaidTier = subscription.tier === SubscriptionTier.MEMBER;
      const isStillValid = new Date(subscription.currentPeriodEnd) > new Date();

      hasPaidSubscription = isPaidTier && (
        subscription.status === SubscriptionStatus.ACTIVE ||
        (subscription.status === SubscriptionStatus.CANCELED && isStillValid)
      );

      console.log(`[API] User ${userId} subscription: tier=${subscription.tier}, status=${subscription.status}, isStillValid=${isStillValid}, hasPaidSubscription=${hasPaidSubscription}`);
    } else {
      console.log(`[API] User ${userId} has no subscription`);
    }

    if (!hasPaidSubscription) {
      // For free users, check if they already have a post
      const postCount = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM "Post"
        WHERE "authorId" = ${userId}
      `;

      console.log(`[API] User ${userId} has ${postCount[0].count} posts`);

      // Free users can only create 1 post
      const canCreate = postCount[0].count < 1;
      console.log(`[API] User ${userId} can create a post: ${canCreate}`);

      if (!canCreate) {
        return NextResponse.json(
          {
            error: 'Free users can only create 1 post. Please upgrade to a paid subscription to create more posts.',
            subscriptionRequired: true
          },
          { status: 403 }
        );
      }
    }

    const {
      title,
      content,
      excerpt,
      status,
      featuredImage,
      categoryIds,
      // SEO fields
      seoTitle,
      seoDescription,
      seoKeywords,
      seoCanonicalUrl,
      ogImage,
      noIndex
    } = await request.json();

    // Create the post
    const post = await prisma.$transaction(async (tx) => {
      // Calculate reading time
      const readingTime = calculateReadingTime(content);

      // Create the post
      const newPost = await tx.post.create({
        data: {
          title,
          content,
          excerpt,
          status: status || 'draft',
          featuredImage,
          readingTime,
          authorId: userId,
          // SEO fields
          seoTitle,
          seoDescription,
          seoKeywords,
          seoCanonicalUrl,
          ogImage,
          noIndex: noIndex || false,
        },
      });

      // Connect categories if provided
      if (categoryIds && categoryIds.length > 0) {
        // First, validate that all categories exist
        const validCategories = await tx.category.findMany({
          where: {
            id: {
              in: categoryIds
            }
          },
          select: {
            id: true
          }
        });

        const validCategoryIds = validCategories.map(cat => cat.id);

        if (validCategoryIds.length > 0) {
          // Only create connections for valid categories
          await tx.postCategory.createMany({
            data: validCategoryIds.map((categoryId: string) => ({
              postId: newPost.id,
              categoryId,
            })),
          });

          // Update category post counts
          for (const categoryId of validCategoryIds) {
            await tx.category.update({
              where: { id: categoryId },
              data: { postCount: { increment: 1 } },
            });
          }
        }
      }

      // Increment user's post count
      await tx.user.update({
        where: { id: userId },
        data: { postCount: { increment: 1 } },
      });

      return newPost;
    });

    // Process mentions in the post content
    if (post.status === 'published') {
      // Only process mentions and send notifications for published posts
      await processPostMentions(
        post.id,
        content,
        userId,
        title
      );

      // Notify followers about the new post
      await createNewPostNotification({
        postId: post.id,
        authorId: userId
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);

    // Provide more detailed error message
    const errorMessage = error instanceof Error
      ? `Failed to create post: ${error.message}`
      : 'Failed to create post';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
