"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { BarChart, PieChart, TrendingUp, Users, Eye, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { usePostAnalytics, useEngagementAnalytics } from "@/hooks/use-analytics";
import { EngagementChart } from "@/app/components/analytics/EngagementChart";
import { CategoryChart } from "@/app/components/analytics/CategoryChart";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  // Fetch dashboard stats for analytics
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();

  // Fetch post analytics for detailed insights
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = usePostAnalytics({
    limit: 10
  });

  // Fetch engagement analytics for charts
  const { data: engagementData, isLoading: engagementLoading, error: engagementError } = useEngagementAnalytics();

  const posts = analyticsData?.posts || [];
  const isLoading = statsLoading || analyticsLoading || engagementLoading;
  const error = statsError || analyticsError || engagementError;

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

  // Use real analytics data from dashboard stats
  const totalViews = stats?.totalViews || 0;
  const totalLikes = stats?.totalLikes || 0;
  const totalComments = stats?.totalComments || 0;
  const publishedPosts = stats?.publishedPosts || 0;

  // Find the most popular post (posts are already sorted by viewCount desc)
  const mostPopularPost = Array.isArray(posts) && posts.length > 0 ? posts[0] : null;

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
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Total published posts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
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
                    Published: {mostPopularPost.publishedAt
                      ? new Date(mostPopularPost.publishedAt).toLocaleDateString()
                      : new Date(mostPopularPost.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">{mostPopularPost.viewCount} views</span>
                    <span className="text-green-600">{mostPopularPost.likeCount} likes</span>
                    <span className="text-orange-600">{mostPopularPost.commentCount} comments</span>
                    <span className="text-purple-600">{mostPopularPost.engagementRate}% engagement</span>
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
                  {totalViews > 0
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
                  {publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0}
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
                  {publishedPosts > 0 ? (totalComments / publishedPosts).toFixed(1) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average comments across all posts
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Performance</CardTitle>
              <CardDescription>
                Detailed analytics for your published posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{post.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            Published: {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString()
                              : new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{post.engagementRate}%</div>
                          <div className="text-xs text-muted-foreground">engagement</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likeCount} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.commentCount} comments
                        </span>
                      </div>
                      {post.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {post.categories.map((category) => (
                            <span key={category.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <div className="text-sm text-muted-foreground">
                      No published posts yet. Create your first post to see analytics!
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Post</CardTitle>
                <CardDescription>
                  Views vs engagement for top performing posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {engagementData?.engagementByPost ? (
                  <EngagementChart data={engagementData.engagementByPost} />
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">
                        {isLoading ? "Loading engagement data..." : "No engagement data available"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Posts distribution across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {engagementData?.categoryDistribution ? (
                  <CategoryChart data={engagementData.categoryDistribution} />
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">
                        {isLoading ? "Loading category data..." : "No category data available"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Engagement Metrics */}
          {engagementData?.summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementData.summary.averageEngagementRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all posts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {engagementData.summary.totalLikes + engagementData.summary.totalComments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Likes + Comments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementData.summary.totalCategories}</div>
                  <p className="text-xs text-muted-foreground">
                    With published posts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Content Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementData.summary.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    Total views
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
