'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import PostCard from "@/app/components/PostCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/app/components/ui/pagination";
import { useUser, useUserPosts } from "@/hooks/use-users";

type SearchParams = {
  page?: string;
};

export default function UserPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [id, setId] = useState<string>('');
  const [page, setPage] = useState(1);

  // Get the ID and search params from props
  useEffect(() => {
    Promise.all([params, searchParams]).then(([paramsData, searchParamsData]) => {
      setId(paramsData.id);
      setPage(Number(searchParamsData.page) || 1);
    });
  }, [params, searchParams]);

  const { data: user, isLoading: userLoading, error: userError } = useUser(id, !!id);
  const { data: postsData, isLoading: postsLoading, error: postsError } = useUserPosts(
    id,
    { page, limit: 12 },
    !!id
  );

  const isLoading = userLoading || postsLoading;
  const error = userError || postsError;
  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || { totalPages: 1, page: 1, totalCount: 0 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href={`/profile/${id}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Profile
                </Link>
              </Button>
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href={`/profile/${id}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Profile
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">User Posts</h1>
            </div>
            <div className="text-center py-12">
              <p className="text-red-500">User not found or failed to load.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href={`/profile/${id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{user.name} Posts</h1>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No posts found</h2>
              <p className="text-muted-foreground">
                This user has not published any posts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    createdAt: new Date(post.createdAt),
                    publishedAt: new Date(post.createdAt), // Use createdAt as fallback
                    readingTime: 5, // Default reading time
                    viewCount: 0,
                    likeCount: 0,
                    commentCount: 0,
                    author: {
                      id: user?.id || '',
                      name: user?.name || 'Unknown',
                      image: user?.image || null,
                      bio: user?.bio || null,
                    },
                    categories: [],
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  {pagination.page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/profile/${id}/posts?page=${pagination.page - 1}`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    const isCurrentPage = pageNumber === pagination.page;
                    const href = `/profile/${id}/posts?page=${pageNumber}`;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink href={href} isActive={isCurrentPage}>
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {pagination.page < pagination.totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/profile/${id}/posts?page=${pagination.page + 1}`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
