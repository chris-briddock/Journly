import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, Eye } from "lucide-react";
import type { Metadata } from "next/types";

import { auth } from "@/lib/auth";
import { getApiUrl } from "@/lib/getApiUrl";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { CommentType } from "@/app/components/CommentList";
import { CommentsSection } from "@/app/components/CommentsSection";
import { ShareButton } from "@/app/components/ShareButton";
import { LikeButton } from "@/app/components/LikeButton";
import { EmbedRenderer } from "@/app/components/EmbedRenderer";
import { FeaturedImage } from "@/app/components/FeaturedImage";
import { RelatedPostImage } from "@/app/components/RelatedPostImage";
import { RecommendedPosts } from "@/app/components/RecommendedPosts";
import { getInitials } from "@/lib/utils";
import { ReadingProgressTracker } from "@/app/components/ReadingProgressTracker";
import { Post } from "@/types/models/post";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post Not Found - Journly",
    };
  }

  // Use SEO fields if available, otherwise use post fields
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const ogImage = post.ogImage || post.featuredImage || undefined;

  const metadata: Metadata = {
    title: `${title} - Journly`,
    description,
    keywords: post.seoKeywords || undefined,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.id}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: post.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };

  // Add canonical URL if available
  if (post.seoCanonicalUrl) {
    metadata.alternates = {
      canonical: post.seoCanonicalUrl,
    };
  }

  return metadata;
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(getApiUrl(`/api/posts/${id}/view`), {
      next: { revalidate: 0 }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getPostComments(postId: string): Promise<CommentType[]> {
  try {
    const response = await fetch(getApiUrl(`/api/posts/${postId}/comments`), {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function getRelatedPosts(postId: string, categoryIds: string[]): Promise<Post[]> {
  if (categoryIds.length === 0) return [];

  try {
    const response = await fetch(
      getApiUrl(`/api/posts/${postId}/related?categoryIds=${categoryIds.join(',')}&limit=3`),
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch related posts');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const [post, comments] = await Promise.all([
    getPost(id),
    getPostComments(id),
  ]);

  if (!post) {
    notFound();
  }

  const session = await auth();
  const isAuthor = session?.user?.id === post.author.id;

  const categoryIds = post.categories.map((c: { category: { id: string } }) => c.category.id);
  const relatedPosts = await getRelatedPosts(post.id, categoryIds);

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Client-side component to track reading progress */}
      <ReadingProgressTracker postId={post.id} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(({ category }: { category: { id: string; name: string } }) => (
                <Link href={`/posts?categoryId=${category.id}`} key={category.id}>
                  <Badge variant="secondary">{category.name}</Badge>
                </Link>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={post.author.image || undefined} alt={post.author.name || "User"} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{formatDate(post.publishedAt || post.createdAt)}</p>
                    <p>{post.readingTime} min read</p>
                  </div>
                </div>
              </Link>

              {isAuthor && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/posts/edit/${post.id}`}>Edit Post</Link>
                </Button>
              )}
            </div>

            {post.featuredImage && (
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
                <FeaturedImage
                  src={post.featuredImage}
                  alt={post.title}
                  priority
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

          {/* Post Footer */}
          <div className="flex items-center justify-between py-4 border-t border-b">
            <div className="flex items-center gap-6">
              <LikeButton
                postId={post.id}
                initialLikeCount={post.likeCount}
                variant="ghost"
                size="sm"
              />
              <div className="flex items-center gap-1">
                <MessageSquare className="h-5 w-5" />
                <span>{post.commentCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-5 w-5" />
                <span>{post.viewCount}</span>
              </div>
            </div>
            <ShareButton
              title={post.title}
              url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.id}`}
              variant="ghost"
              size="sm"
            />
          </div>

          {/* Author Bio */}
          {post.author.bio && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.image || undefined} alt={post.author.name || "User"} />
                    <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">About {post.author.name}</h3>
                    <p className="text-muted-foreground">{post.author.bio}</p>
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <Link href={`/profile/${post.author.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection postId={post.id} initialComments={comments} />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost: Post) => (
                  <Card key={relatedPost.id} className="overflow-hidden">
                    {relatedPost.featuredImage && (
                      <div className="relative w-full h-32 overflow-hidden">
                        <Link href={`/posts/${relatedPost.id}`}>
                          <RelatedPostImage
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                          />
                        </Link>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Link href={`/posts/${relatedPost.id}`} className="group">
                        <h3 className="font-semibold group-hover:underline line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{relatedPost.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                        <span>·</span>
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Posts based on reading history */}
        <div className="max-w-7xl mx-auto mt-16">
          <RecommendedPosts limit={3} />
        </div>
      </div>
    </div>
  );
}
