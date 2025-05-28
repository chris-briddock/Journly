"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, Eye, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { CommentsSection } from "@/app/components/CommentsSection";
import { ShareButton } from "@/app/components/ShareButton";
import { LikeButton } from "@/app/components/LikeButton";
import { BookmarkButton } from "@/app/components/BookmarkButton";
import { EmbedRenderer } from "@/app/components/EmbedRenderer";
import { FeaturedImage } from "@/app/components/FeaturedImage";
import { RelatedPostImage } from "@/app/components/RelatedPostImage";
import { RecommendedPosts } from "@/app/components/RecommendedPosts";
import { getInitials } from "@/lib/utils";
import { ReadingProgressTracker } from "@/app/components/ReadingProgressTracker";
import { Post } from "@/types/models/post";
import { usePost, useRelatedPosts, useArticleAccess } from "@/hooks/use-posts";
import { usePostComments } from "@/hooks/use-comments";
import { useArticleCount } from "@/hooks/use-subscriptions";
import { Loader2 } from "lucide-react";

type PostPageClientProps = {
  postId: string;
};

export function PostPageClient({ postId }: PostPageClientProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Use TanStack Query to fetch post data
  const { data: post, isLoading: postLoading, error: postError } = usePost(postId);

  // Check article access
  const { data: accessData, isLoading: accessLoading, error: accessError } = useArticleAccess(
    postId,
    !!session?.user?.id && !!post
  );

  // Get category IDs for related posts
  const categoryIds = Array.isArray(post?.categories)
    ? post.categories.map((c: { category?: { id?: string } }) => c?.category?.id).filter((id): id is string => Boolean(id))
    : [];
  const { data: relatedPosts } = useRelatedPosts(postId, categoryIds, 3, categoryIds.length > 0);

  // Prefetch comments for better performance
  const { data: comments } = usePostComments(postId);
  const { data: articleCountData } = useArticleCount();

  // Handle access control and redirects
  useEffect(() => {
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      router.push(`/login?from=/posts/${postId}`);
      return;
    }

    if (accessError) {
      // If there's an access error, redirect to subscription page
      router.push(`/subscription?from=/posts/${postId}`);
      return;
    }

    if (accessData && !accessData.canAccess) {
      // If user can't access the article, redirect to subscription page
      router.push(`/subscription?from=/posts/${postId}`);
      return;
    }
  }, [session, accessData, accessError, postId, router]);

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Loading state
  if (postLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state or post not found
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
              <p className="mb-4">The requested post could not be found.</p>
              <Button asChild>
                <Link href="/posts">Browse Posts</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="mb-4">You need to be logged in to view this article.</p>
          <Button asChild>
            <Link href={`/login?from=/posts/${post.id}`}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Access control check
  if (accessError || (accessData && !accessData.canAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-4">You need a subscription to access this article.</p>
          <Button asChild>
            <Link href={`/subscription?from=/posts/${post.id}`}>Get Subscription</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = session.user.id === post.author.id;

  // User has access to the article
  const hasAccess = accessData?.canAccess || false;
  const articlesReadThisMonth = articleCountData?.articlesReadThisMonth || 0;
  const monthlyLimit = 5; // Default monthly limit for free users

  return (
    <div className="min-h-screen bg-background">
      {/* Client-side component to track reading progress - only render when post is loaded */}
      {post && <ReadingProgressTracker postId={post.id} />}
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
              <BookmarkButton
                postId={post.id}
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
            <CommentsSection postId={post.id} initialComments={comments || []} />
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
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
