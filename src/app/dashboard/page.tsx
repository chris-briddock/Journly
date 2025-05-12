import Link from "next/link";
import { redirect } from "next/navigation";
import { Edit, FileText, BarChart2, Tag, Settings } from "lucide-react";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

interface Post {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Direct database query using Prisma
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      totalComments,
    ] = await Promise.all([
      prisma.post.count({
        where: { authorId: userId },
      }),
      prisma.post.count({
        where: { authorId: userId, status: "published" },
      }),
      prisma.post.count({
        where: { authorId: userId, status: "draft" },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          viewCount: true,
        },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          likeCount: true,
        },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          commentCount: true,
        },
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalLikes: totalLikes._sum.likeCount || 0,
      totalComments: totalComments._sum.commentCount || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }
}

async function getRecentPosts(userId: string, limit = 5): Promise<Post[]> {
  try {
    // Direct database query using Prisma
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return posts;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id as string;
  const [stats, recentPosts] = await Promise.all([
    getDashboardStats(userId),
    getRecentPosts(userId),
  ]);

  const dashboardItems = [
    {
      title: "Posts",
      icon: FileText,
      description: "Manage your blog posts",
      href: "/dashboard/posts",
    },
    {
      title: "Categories",
      icon: Tag,
      description: "Organize your content with categories",
      href: "/dashboard/categories",
    },
    {
      title: "Analytics",
      icon: BarChart2,
      description: "View your content performance",
      href: "/dashboard/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      description: "Manage your account settings",
      href: "/dashboard/settings",
    },
  ];

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
              <div className="text-3xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
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
              <div className="text-3xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalLikes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalComments}</div>
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

        <Card>
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
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
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
          {recentPosts.length > 0 && (
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/posts">View All Posts</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
