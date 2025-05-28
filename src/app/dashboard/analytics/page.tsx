"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { BarChart, LineChart, PieChart, TrendingUp, Users, Eye, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
// Remove unused import
import { useUserPosts } from "@/hooks/use-users";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  // Use TanStack Query to fetch user posts (call hooks before any early returns)
  const { data: postsData, isLoading, error } = useUserPosts(
    session?.user?.id || "",
    { status: "published" },
    !!session?.user?.id
  );
  const posts = postsData?.posts || [];

  if (status === "loading") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="View analytics for your posts and audience engagement."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="View analytics for your posts and audience engagement."
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </DashboardShell>
    );
  }

  // Check if posts is an array before using reduce
  const isPostsArray = Array.isArray(posts);

  // Calculate total views, likes, and comments
  // Note: User posts API doesn't include these metrics, so we'll show 0 for now
  const totalViews = 0;
  const totalLikes = 0;
  const totalComments = 0;

  // Find the most popular post (by title for now since we don't have metrics)
  const mostPopularPost = isPostsArray && posts.length > 0 ? posts[0] : null;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics"
        text="View analytics for your posts and audience engagement."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Across all your posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              Across all your posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground">
              Across all your posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total published posts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Post</CardTitle>
              <CardDescription>
                Your post with the most views
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mostPopularPost ? (
                <div className="space-y-2">
                  <h3 className="font-medium">{mostPopularPost.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    Published: {new Date(mostPopularPost.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t published any posts yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.length > 0
                    ? `${((totalLikes + totalComments) / totalViews * 100).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Likes and comments per view
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Views per Post
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.length > 0 ? Math.round(totalViews / posts.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average views across all posts
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Comments per Post
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.length > 0 ? (totalComments / posts.length).toFixed(1) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average comments across all posts
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>
                This chart will show your post views over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="flex h-[200px] items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <div className="ml-4 text-sm text-muted-foreground">
                  Advanced analytics will be available in a future update
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Post</CardTitle>
                <CardDescription>
                  Likes and comments distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex h-[200px] items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <div className="ml-4 text-sm text-muted-foreground">
                    Advanced analytics will be available in a future update
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Posts by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex h-[200px] items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                  <div className="ml-4 text-sm text-muted-foreground">
                    Advanced analytics will be available in a future update
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
