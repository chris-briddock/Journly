import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, Eye, Lock } from "lucide-react";
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
import { canAccessArticle, getArticlesReadThisMonth, getMonthlyArticleLimit, recordArticleAccess } from "@/lib/services/article-access-service";

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

  // Check if the user can access this article
  const userId = session?.user?.id || null;

  // If no user is logged in, they should be redirected by middleware
  if (!userId) {
    // This is a fallback in case middleware fails
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="mb-4">You need to be logged in to view this article.</p>
          <Button asChild>
            <Link href={`/login?from=/posts/${id}`}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // The middleware should handle access control and recording article access
  // If the user is the author, they can always access their own posts
  // For debugging purposes, let's log the access check
  console.log(`[Page] Checking access for user: ${userId}, post: ${id}, isAuthor: ${isAuthor}`);

  // Check if the user can access the article
  const canAccess = isAuthor || await canAccessArticle(userId, id);
  console.log(`[Page] Access result: ${canAccess}`);

  // If the user can access the article and is not the author, record the access
  // This is a fallback in case the middleware fails to record the access
  if (canAccess && !isAuthor) {
    console.log(`[Page] Recording article access as fallback`);
    await recordArticleAccess(userId, id);
  }

  const hasAccess = canAccess;

  // Get the user's article access info
  const articlesReadThisMonth = await getArticlesReadThisMonth(userId);
  const monthlyLimit = await getMonthlyArticleLimit(userId);

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
              {hasAccess ? (
                <EmbedRenderer content={post.content} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Lock className="h-12 w-12 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Post Limit Reached</h2>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    You&apos;ve read <span className="font-bold text-primary">{articlesReadThisMonth}</span> of your <span className="font-bold text-primary">{monthlyLimit}</span> free posts this month.
                  </p>

                  <div className="bg-primary/5 p-6 rounded-xl mb-6 max-w-md">
                    <h3 className="font-semibold text-lg mb-3">Become a member today and get:</h3>
                    <ul className="text-left space-y-2 mb-4">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited access to all content</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Ad-free reading experience</span>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">Only $4.99/month. Cancel anytime.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="font-medium">
                      <Link href="/subscription">Become a Member</Link>
                    </Button>
                  </div>
                </div>
              )}
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
