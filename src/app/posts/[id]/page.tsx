import type { Metadata } from "next/types";
import { PostPageClient } from "./PostPageClient";
import prisma from "@/lib/prisma";
import { generateSeoMetadata } from "@/lib/services/generateSeoMetadata";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Generate metadata for SEO using direct database access
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;

    // Fetch post data directly from database for server-side rendering
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
      return {
        title: "Post Not Found - Journly",
        description: "The requested post could not be found.",
      };
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
    const authorName = post.author.name || 'Unknown Author';
    const categoryNames = post.categories.map(({ category }) => category.name);

    // Build comprehensive metadata
    return {
      title: seoMetadata.title,
      description: seoMetadata.description,
      keywords: seoMetadata.keywords || categoryNames.join(', '),
      authors: [{ name: authorName }],
      openGraph: {
        title: seoMetadata.title,
        description: seoMetadata.description,
        url: postUrl,
        siteName: 'Journly',
        images: seoMetadata.ogImage ? [{
          url: seoMetadata.ogImage,
          width: 1200,
          height: 630,
          alt: seoMetadata.title,
        }] : [],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        authors: [authorName],
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
    };
  } catch (error) {
    console.error('Error generating metadata for post:', error);

    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }
}

// Server component that passes the post ID to the client component
export default async function PostPage({ params }: Props) {
  const { id } = await params;

  // Pass the post ID to the client component which will use TanStack Query
  return <PostPageClient postId={id} />;
}
