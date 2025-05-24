import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateSeoMetadata } from '@/lib/services/generateSeoMetadata';

// POST /api/posts/seo - Generate SEO metadata for a post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to generate SEO metadata' },
        { status: 401 }
      );
    }

    const { title, content, excerpt } = await request.json();

    // Generate SEO metadata
    const metadata = generateSeoMetadata({
      title,
      content,
      excerpt,
    });

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO metadata' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/seo/[id] - Update SEO metadata for a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update SEO metadata' },
        { status: 401 }
      );
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update SEO metadata for your own posts' },
        { status: 403 }
      );
    }

    const {
      seoTitle,
      seoDescription,
      seoKeywords,
      seoCanonicalUrl,
      ogImage,
      noIndex,
    } = await request.json();

    // Update the post's SEO metadata
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        seoTitle,
        seoDescription,
        seoKeywords,
        seoCanonicalUrl,
        ogImage,
        noIndex,
      },
      select: {
        id: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        ogImage: true,
        noIndex: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO metadata' },
      { status: 500 }
    );
  }
}

// GET /api/posts/seo/[id] - Get SEO metadata for a post
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the post's SEO metadata
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        ogImage: true,
        noIndex: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO metadata' },
      { status: 500 }
    );
  }
}
