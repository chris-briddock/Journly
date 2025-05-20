'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Edit, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { getScheduledPosts } from '@/lib/services/getScheduledPosts';

interface ScheduledPost {
  id: string;
  title: string;
  scheduledPublishAt: Date;
}

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getScheduledPosts({ page, limit: 10 });
        
        setPosts(response.posts || []);
        setHasMore(response.hasMore || false);
      } catch (err) {
        console.error('Error fetching scheduled posts:', err);
        setError('Failed to load scheduled posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduledPosts();
  }, [page]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Scheduled Posts</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Scheduled Posts</h1>
          </div>
          
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Scheduled Posts</h1>
        </div>
        
        {posts.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/dashboard/posts/edit/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-2" />
                      Scheduled for {format(new Date(post.scheduledPublishAt), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/posts/edit/${post.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
