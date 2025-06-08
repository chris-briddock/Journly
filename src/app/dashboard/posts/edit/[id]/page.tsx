"use client";

import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import PostForm from "@/app/components/PostForm";
import { usePostForEdit } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditPostPage({ params }: Props) {
  const { data: session, status } = useSession();

  // Parse params using React.use() to avoid hook order issues
  const { id: postId } = React.use(params);

  // Use TanStack Query hooks (call before any early returns)
  const { data: post, isLoading: postLoading, error: postError } = usePostForEdit(postId, !!postId);
  const { data: categories, isLoading: categoriesLoading } = useCategories({ dashboard: true });

  // Handle all conditional logic without early returns to maintain hook order
  const isLoading = status === "loading" || postLoading || categoriesLoading;
  const isAuthenticated = !!session?.user?.id;
  const hasError = postError || !post;
  const isAuthorized = post?.author && post.author.id === session?.user?.id;
  const isPostDataComplete = post && post.id && post.title && post.categories;

  // Authentication redirect (only if not loading)
  if (!isLoading && !isAuthenticated) {
    redirect("/login");
  }

  // Error redirect (only if not loading and authenticated)
  if (!isLoading && isAuthenticated && hasError) {
    notFound();
  }

  // Authorization redirect (only if not loading, authenticated, no error, but not authorized)
  if (!isLoading && isAuthenticated && !hasError && !isAuthorized) {
    redirect("/dashboard/posts");
  }

  // Show loading state
  if (isLoading || !isPostDataComplete) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/dashboard/posts">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Posts
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Post</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : "Loading post data..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/posts">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Posts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
            <CardDescription>
              Update your post details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm
              initialData={{
                id: post.id,
                title: post.title,
                content: post.content,
                excerpt: post.excerpt || "",
                featuredImage: post.featuredImage || "",
                status: post.status,
                categoryIds: Array.isArray(post.categories)
                  ? post.categories.map(c => c?.category?.id).filter(Boolean)
                  : [],
                scheduledPublishAt: post.scheduledPublishAt ? new Date(post.scheduledPublishAt).toISOString() : undefined,
                // SEO fields
                seoTitle: post.seoTitle || "",
                seoDescription: post.seoDescription || "",
                seoKeywords: post.seoKeywords || "",
                seoCanonicalUrl: post.seoCanonicalUrl || "",
                ogImage: post.ogImage || "",
                noIndex: post.noIndex || false,
              }}
              categories={categories || []}
              isEditing
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
