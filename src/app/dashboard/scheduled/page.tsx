'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Edit, Clock, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';

interface ScheduledPost {
  id: string;
  title: string;
  scheduledPublishAt: string;
  excerpt?: string;
  featuredImage?: string;
}

interface ScheduledPostsResponse {
  posts: ScheduledPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/posts/schedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheduled posts');
      }

      const data: ScheduledPostsResponse = await response.json();
      setPosts(data.posts || []);
      setLastChecked(new Date());
    } catch (err: unknown) {
      console.error('Error fetching scheduled posts:', err);
      setError('Failed to load scheduled posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkScheduledPosts = async () => {
    try {
      setRefreshing(true);

      // Call the publish-scheduled endpoint
      const response = await fetch('/api/cron/publish-scheduled', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to check scheduled posts');
      }

      const data = await response.json();
      setLastChecked(new Date());

      // If posts were published, show a toast and refresh the list
      if (data.publishedCount > 0) {
        toast.success(`${data.publishedCount} scheduled post${data.publishedCount === 1 ? '' : 's'} published`);
        fetchScheduledPosts();
      } else {
        toast.info('No posts due for publishing');
        fetchScheduledPosts();
      }
    } catch (error: unknown) {
      console.error('Error checking scheduled posts:', error);
      toast.error('Failed to check scheduled posts');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Scheduled Posts"
        text="Manage your scheduled posts."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkScheduledPosts}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Now
              </>
            )}
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/posts/new">
              Create Post
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      {lastChecked && (
        <p className="text-sm text-muted-foreground mb-4">
          Last checked: {format(lastChecked, "MMM d, yyyy 'at' h:mm a")}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchScheduledPosts}>Try Again</Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-center mb-4">You don&apos;t have any scheduled posts</p>
            <Button asChild>
              <Link href="/dashboard/posts/new">Create a New Post</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboard/posts/edit/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Scheduled for {format(new Date(post.scheduledPublishAt), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="outline">Scheduled</Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/posts/edit/${post.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
