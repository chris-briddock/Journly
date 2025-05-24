import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, Eye, AlertTriangle, Edit } from "lucide-react";
import type { Metadata } from "next/types";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { EmbedRenderer } from "@/app/components/EmbedRenderer";
import { FeaturedImage } from "@/app/components/FeaturedImage";
import { getInitials } from "@/lib/utils";
import { Post } from "@/types/models/post";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return {
      title: "Post Preview Not Found - Journly",
    };
  }

  const post = await getPostPreview(id, session.user.id);

  if (!post) {
    return {
      title: "Post Preview Not Found - Journly",
    };
  }

  return {
    title: `Preview: ${post.title} - Journly`,
    description: post.excerpt || `Preview of ${post.title}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

function formatDate(date: Date | string): string {
  return format(new Date(date), "MMMM d, yyyy");
}

async function getPostPreview(id: string, userId: string): Promise<Post | null> {
  try {
    // Direct database query for server-side rendering
    const prisma = (await import('@/lib/prisma')).default;

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
      return null;
    }

    // Only allow the author to preview their own posts
    if (post.authorId !== userId) {
      return null;
    }

    // Add SEO fields
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
    if (seoData) {
      Object.assign(post, seoData);
    }

    return post as Post;
  } catch (error) {
    console.error('Error fetching post preview:', error);
    return null;
  }
}

export default async function PostPreviewPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  // Require authentication
  if (!session || !session.user) {
    redirect(`/login?from=/posts/${id}/preview`);
  }

  const post = await getPostPreview(id, session.user.id);

  if (!post) {
    notFound();
  }

  // Double-check that the user is the author
  const authorId = (post as Post & { authorId?: string }).authorId || post.author?.id;
  if (authorId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Preview Alert */}
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Preview Mode:</strong> This is a preview of your {post.status} post.
              Only you can see this preview.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button asChild>
              <Link href={`/dashboard/posts/edit/${post.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/posts">
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(({ category }: { category: { id: string; name: string } }) => (
                <Badge key={category.id} variant="secondary">{category.name}</Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
                  <AvatarFallback>{getInitials(post.author?.name || "User")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author?.name || "Author"}</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{formatDate(post.publishedAt || post.createdAt)}</p>
                    <p>{post.readingTime} min read</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8">
                <FeaturedImage
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Post Content */}
          <article className="mb-8 post-content-wrapper">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <EmbedRenderer content={post.content} />
            </div>
          </article>

          {/* Post Stats */}
          <div className="flex items-center gap-6 py-4 border-t border-b">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </div>
          </div>

          {/* Author Bio */}
          {post.author?.bio && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
                    <AvatarFallback>{getInitials(post.author?.name || "User")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">About {post.author?.name}</h3>
                    <p className="text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Footer */}
          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              This is a preview of your {post.status} post.
            </p>
            <Button asChild>
              <Link href={`/dashboard/posts/edit/${post.id}`}>
                Continue Editing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
