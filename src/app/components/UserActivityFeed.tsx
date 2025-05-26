"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { getApiUrl } from "@/lib/getApiUrl";

import { Skeleton } from "@/app/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/app/components/ui/pagination";
import { EmptyPlaceholder } from "@/app/components/EmptyPlaceholder";

type ActivityType = 'post' | 'comment' | 'like';

interface Activity {
  id: string;
  type: ActivityType;
  createdAt: string;
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string | null;
  post?: {
    id: string;
    title: string;
    featuredImage?: string | null;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserActivityFeedProps {
  userId: string;
  userName?: string | null;
}

export function UserActivityFeed({ userId, userName }: UserActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const url = getApiUrl(`/api/users/${userId}/activity?page=${page}&limit=${pagination.limit}`);

      // During build time, skip API call
      if (!url) {
        console.log('[Build] Skipping activity feed API call during static generation');
        setIsLoading(false);
        return;
      }

      const response = await fetch(url, {
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user activity");
      }

      const data = await response.json();
      setActivities(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      toast.error("Failed to load user activity");
    } finally {
      setIsLoading(false);
    }
  }, [userId, pagination.limit]);

  useEffect(() => {
    fetchActivities();
  }, [userId, fetchActivities]);

  const handlePageChange = (page: number) => {
    fetchActivities(page);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5" />;
    }
  };

  const getActivityTitle = (activity: Activity) => {
    const name = userName || 'User';

    switch (activity.type) {
      case 'post':
        return `${name} published a post`;
      case 'comment':
        return `${name} commented on a post`;
      case 'like':
        return `${name} liked a post`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-2">
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon>
          <FileText className="h-8 w-8" />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No activity yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          This user hasn&apos;t posted, commented, or liked anything yet.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardHeader className="p-4">
            <div className="flex items-center gap-2">
              {getActivityIcon(activity.type)}
              <CardTitle className="text-base">
                {getActivityTitle(activity)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {activity.type === 'post' && (
              <div className="flex flex-col md:flex-row gap-4">
                {activity.featuredImage && (
                  <div className="relative h-32 w-full md:w-48 flex-shrink-0">
                    <Image
                      src={activity.featuredImage}
                      alt={activity.title || "Post image"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div>
                  <Link href={`/posts/${activity.id}`} className="font-medium hover:underline">
                    {activity.title}
                  </Link>
                  {activity.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {activity.excerpt}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activity.type === 'comment' && (
              <div>
                <Link href={`/posts/${activity.post?.id}`} className="font-medium hover:underline">
                  {activity.post?.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  &quot;{activity.content && activity.content.length > 100
                    ? `${activity.content.substring(0, 100)}...`
                    : activity.content}&quot;
                </p>
              </div>
            )}

            {activity.type === 'like' && (
              <div className="flex items-center gap-4">
                {activity.post?.featuredImage && (
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={activity.post.featuredImage}
                      alt={activity.post.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <Link href={`/posts/${activity.post?.id}`} className="font-medium hover:underline">
                  {activity.post?.title}
                </Link>
              </div>
            )}

            <div className="mt-2 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      ))}

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {pagination.page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pagination.page - 1);
                  }}
                />
              </PaginationItem>
            )}

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              )
              .map((page, i, array) => {
                // Add ellipsis
                if (i > 0 && page > array[i - 1] + 1) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === pagination.page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

            {pagination.page < pagination.totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pagination.page + 1);
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
