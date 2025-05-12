import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateReadingTime } from '@/lib/readingTime';

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
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a post' },
        { status: 401 }
      );
    }

    const { title, content, excerpt, status, featuredImage, categoryIds } = await request.json();

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
          authorId: session.user?.id as string,
        },
      });

      // Connect categories if provided
      if (categoryIds && categoryIds.length > 0) {
        await tx.postCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            postId: newPost.id,
            categoryId,
          })),
        });

        // Update category post counts
        for (const categoryId of categoryIds) {
          await tx.category.update({
            where: { id: categoryId },
            data: { postCount: { increment: 1 } },
          });
        }
      }

      // Increment user's post count
      await tx.user.update({
        where: { id: session.user?.id as string },
        data: { postCount: { increment: 1 } },
      });

      return newPost;
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
