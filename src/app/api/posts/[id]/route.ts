import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateReadingTime } from '@/lib/readingTime';

// GET /api/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update a post' },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own posts' },
        { status: 403 }
      );
    }

    const { title, content, excerpt, status, featuredImage, categoryIds } = await request.json();

    // Update the post with transaction to handle category changes
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Calculate reading time
      const readingTime = calculateReadingTime(content);

      // Update the post
      const updated = await tx.post.update({
        where: { id },
        data: {
          title,
          content,
          excerpt,
          status,
          featuredImage,
          readingTime,
        },
      });

      // Handle category changes if provided
      if (categoryIds) {
        // Get current category IDs
        const currentCategoryIds = post.categories.map((pc: { categoryId: string }) => pc.categoryId);

        // Find categories to remove
        const categoriesToRemove = currentCategoryIds.filter(
          (id: string) => !categoryIds.includes(id)
        );

        // Find categories to add
        const categoriesToAdd = categoryIds.filter(
          (id: string) => !currentCategoryIds.includes(id)
        );

        // Remove categories
        if (categoriesToRemove.length > 0) {
          await tx.postCategory.deleteMany({
            where: {
              postId: id,
              categoryId: { in: categoriesToRemove },
            },
          });

          // Decrement post count for removed categories
          for (const categoryId of categoriesToRemove) {
            await tx.category.update({
              where: { id: categoryId },
              data: { postCount: { decrement: 1 } },
            });
          }
        }

        // Add new categories
        if (categoriesToAdd.length > 0) {
          await tx.postCategory.createMany({
            data: categoriesToAdd.map((categoryId: string) => ({
              postId: id,
              categoryId,
            })),
          });

          // Increment post count for added categories
          for (const categoryId of categoriesToAdd) {
            await tx.category.update({
              where: { id: categoryId },
              data: { postCount: { increment: 1 } },
            });
          }
        }
      }

      return updated;
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a post' },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete the post with transaction to update counters
    await prisma.$transaction(async (tx) => {
      // Get category IDs to update counters
      const categoryIds = post.categories.map((pc: { categoryId: string }) => pc.categoryId);

      // Delete the post (will cascade delete postCategories and likes)
      await tx.post.delete({
        where: { id },
      });

      // Decrement category post counts
      for (const categoryId of categoryIds) {
        await tx.category.update({
          where: { id: categoryId },
          data: { postCount: { decrement: 1 } },
        });
      }

      // Decrement user's post count
      await tx.user.update({
        where: { id: post.authorId },
        data: { postCount: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
