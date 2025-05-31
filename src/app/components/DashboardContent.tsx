'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Edit, FileText, BarChart2, Tag, Settings, BookOpen, Clock, CreditCard, Bookmark } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { useDashboardStats, useDashboardRecentPosts } from '@/hooks/use-dashboard';
import { useScheduledPosts } from '@/hooks/use-posts';

export default function DashboardContent() {
  // Use TanStack Query hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentPosts = [], isLoading: postsLoading, error: postsError } = useDashboardRecentPosts(5);
  const { data: scheduledData, isLoading: scheduledLoading, error: scheduledError } = useScheduledPosts({ limit: 5 });

  const loading = statsLoading || postsLoading || scheduledLoading;
  const error = statsError || postsError || scheduledError;
  const scheduledPosts = scheduledData?.posts || [];

  // Provide default values for stats
  const defaultStats = {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  };
  const safeStats = stats || defaultStats;

  const dashboardItems = [
    {
      title: 'Posts',
      icon: FileText,
      description: 'Manage your blog posts',
      href: '/dashboard/posts',
    },
    {
      title: 'Scheduled Posts',
      icon: Clock,
      description: 'Manage your scheduled posts',
      href: '/dashboard/scheduled',
    },
    {
      title: 'Categories',
      icon: Tag,
      description: 'Organize your content with categories',
      href: '/dashboard/categories',
    },
    {
      title: 'Reading History',
      icon: BookOpen,
      description: 'View your reading history',
      href: '/dashboard/reading-history',
    },
    {
      title: 'Bookmarks',
      icon: Bookmark,
      description: 'View your bookmarked posts',
      href: '/dashboard/bookmarks',
    },
    {
      title: 'Analytics',
      icon: BarChart2,
      description: 'View your content performance',
      href: '/dashboard/analytics',
    },
    {
      title: 'Subscription',
      icon: CreditCard,
      description: 'Manage your subscription',
      href: '/dashboard/subscription',
    },
    {
      title: 'Settings',
      icon: Settings,
      description: 'Manage your account settings',
      href: '/dashboard/settings',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-lg text-red-500 mb-4">{error?.message || 'An error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{safeStats.totalPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {safeStats.publishedPosts} published, {safeStats.draftPosts} drafts, {safeStats.scheduledPosts} scheduled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{safeStats.totalViews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{safeStats.totalLikes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{safeStats.totalComments}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your content and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardItems.map((item) => (
                  <Card key={item.href} className="overflow-hidden">
                    <Link href={item.href} className="block h-full">
                      <CardHeader className="p-4">
                        <item.icon className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription>{item.description}</CardDescription>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/posts/new">
                  <Edit className="h-4 w-4 mr-2" />
                  Create New Post
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>
                Your most recently created posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t created any posts yet
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/posts/new">Create Your First Post</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="py-4 flex justify-between items-center">
                      <div>
                        <Link
                          href={`/dashboard/posts/edit/${post.id}`}
                          className="font-medium hover:underline"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant={post.status === "published" ? "success" : "secondary"}>
                            {post.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/posts/edit/${post.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {recentPosts.length > 0 && (
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/posts">View All Posts</Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
              <CardDescription>
                Posts scheduled for future publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t have any scheduled posts
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/posts/new">Create a Post</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="py-4 flex justify-between items-center">
                      <div>
                        <Link
                          href={`/dashboard/posts/edit/${post.id}`}
                          className="font-medium hover:underline"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Scheduled for {post.scheduledPublishAt ? format(new Date(post.scheduledPublishAt), "MMM d, yyyy 'at' h:mm a") : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/posts/edit/${post.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {scheduledPosts.length > 0 && (
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/posts?status=scheduled">View All Scheduled</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
