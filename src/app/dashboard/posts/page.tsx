"use client";

import { Suspense } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { PostsTableClientNew } from "@/app/components/dashboard/PostsTableClientNew";
import { PostsTableSkeleton } from "@/app/components/dashboard/PostsTableSkeleton";
import { SubscriptionTier, SubscriptionStatus } from "@/lib/types";
import { useUserPosts } from "@/hooks/use-users";
import { useSubscription } from "@/hooks/use-subscriptions";
import { Loader2 } from "lucide-react";

export default function PostsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();

  // Use TanStack Query hooks (call before any early returns)
  const { data: subscriptionData } = useSubscription();

  // Parse search params
  const pageParam = searchParams.get('page');
  const statusParam = searchParams.get('status');
  const queryParam = searchParams.get('q');

  // Ensure page is a valid number
  let page = 1;
  if (pageParam) {
    const parsedPage = parseInt(pageParam);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  const status = statusParam || undefined;
  const query = queryParam || undefined;

  // Build filters for posts query
  const filters: Record<string, string | number | boolean | undefined> = {
    page,
    limit: 10,
    dashboard: true, // Mark this as a dashboard request to show all posts
  };

  if (status && status !== 'all') {
    filters.status = status;
  }

  if (query) {
    filters.q = query;
  }

  // Use TanStack Query to fetch user posts
  const { data: postsData, isLoading, error } = useUserPosts(
    session?.user?.id || "",
    filters,
    !!session?.user?.id
  );

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardShell>
          <DashboardHeader
            heading="Posts"
            text="Create and manage your posts."
          />
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardShell>
      </div>
    );
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardShell>
          <DashboardHeader
            heading="Posts"
            text="Create and manage your posts."
          />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Failed to load posts</p>
          </div>
        </DashboardShell>
      </div>
    );
  }

  // Check if the user has a paid subscription
  let hasPaidSubscription = false;
  if (subscriptionData) {
    const isPaidTier = subscriptionData.tier === SubscriptionTier.MEMBER;
    const isStillValid = new Date(subscriptionData.currentPeriodEnd) > new Date();

    hasPaidSubscription = isPaidTier && (
      subscriptionData.status === SubscriptionStatus.ACTIVE ||
      (subscriptionData.status === SubscriptionStatus.CANCELED && isStillValid)
    );
  }

  // Check if the user has reached their post limit (free users can only create 1 post)
  const posts = (postsData?.posts || []).map(post => ({
    ...post,
    viewCount: 0, // Default values for missing properties
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date(post.createdAt),
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
  }));
  const pagination = postsData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };
  const hasReachedPostLimit = !hasPaidSubscription && posts.length >= 1;

  return (
    <div className="min-h-screen bg-background">
      <DashboardShell>
        <DashboardHeader
          heading="Posts"
          text={
            hasPaidSubscription
              ? "Create and manage your posts."
              : posts.length === 0
                ? "Create your first post."
                : "Free users can only create 1 post. Upgrade to create more."
          }
        />

        {hasReachedPostLimit && !hasPaidSubscription && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800 font-medium">
              Free users can only create 1 post. <a href="/subscription" className="underline">Upgrade to a paid subscription</a> to create more posts.
            </p>
          </div>
        )}

        <Suspense fallback={<PostsTableSkeleton />}>
          <PostsTableClientNew
            posts={posts}
            pagination={pagination}
            disableNewPost={hasReachedPostLimit && !hasPaidSubscription}
          />
        </Suspense>
      </DashboardShell>
    </div>
  );
}
