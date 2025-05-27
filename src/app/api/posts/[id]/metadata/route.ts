import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSeoMetadata } from '@/lib/services/generateSeoMetadata';

// GET /api/posts/[id]/metadata - Get post metadata for SEO generation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch post with all necessary data for metadata generation
    const post = await prisma.post.findUnique({
      where: { 
        id,
        status: "published" // Only fetch published posts
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        createdAt: true,
        // SEO fields
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        ogImage: true,
        noIndex: true,
        // Author info for metadata
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // Categories for keywords
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate SEO metadata using our existing service
    const seoMetadata = generateSeoMetadata({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      seoTitle: post.seoTitle || undefined,
      seoDescription: post.seoDescription || undefined,
      seoKeywords: post.seoKeywords || undefined,
      seoCanonicalUrl: post.seoCanonicalUrl || undefined,
      ogImage: post.ogImage || undefined,
      noIndex: post.noIndex || undefined,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const postUrl = `${baseUrl}/posts/${post.id}`;

    // Return structured metadata for Next.js metadata generation
    const metadata = {
      title: seoMetadata.title,
      description: seoMetadata.description,
      keywords: seoMetadata.keywords,
      authors: [{ name: post.author.name || 'Unknown Author' }],
      openGraph: {
        title: seoMetadata.title,
        description: seoMetadata.description,
        url: postUrl,
        siteName: 'Journly',
        images: seoMetadata.ogImage ? [
          {
            url: seoMetadata.ogImage,
            width: 1200,
            height: 630,
            alt: seoMetadata.title,
          }
        ] : [],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author.name || 'Unknown Author'],
      },
      twitter: {
        card: 'summary_large_image',
        title: seoMetadata.title,
        description: seoMetadata.description,
        images: seoMetadata.ogImage ? [seoMetadata.ogImage] : [],
      },
      robots: {
        index: !seoMetadata.noIndex,
        follow: !seoMetadata.noIndex,
        googleBot: {
          index: !seoMetadata.noIndex,
          follow: !seoMetadata.noIndex,
        },
      },
      alternates: seoMetadata.canonicalUrl ? {
        canonical: seoMetadata.canonicalUrl,
      } : {
        canonical: postUrl,
      },
      // Include raw post data for additional processing if needed
      post: {
        id: post.id,
        title: post.title,
        author: post.author,
        publishedAt: post.publishedAt,
        categories: post.categories,
      },
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating post metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate post metadata' },
      { status: 500 }
    );
  }
}
