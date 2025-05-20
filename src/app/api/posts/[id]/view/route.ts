import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/posts/[id]/view - Get a post by ID and increment view count
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
      // Include SEO fields
    });

    // Add SEO fields to the post
    if (post) {
      const seoData = await prisma.post.findUnique({
        where: { id },
        select: {
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          seoCanonicalUrl: true,
          ogImage: true,
          noIndex: true,
        },
      });

      // Merge SEO data with post
      Object.assign(post, seoData);
    }

    if (!post || post.status !== "published") {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
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
