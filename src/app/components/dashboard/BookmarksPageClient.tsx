"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { BookmarkCheck, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { getInitials } from "@/lib/utils";
import { useBookmarks, useTogglePostBookmark } from "@/hooks/use-posts";

export function BookmarksPageClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Use TanStack Query hooks
  const {
    data: bookmarksData,
    isLoading,
    error
  } = useBookmarks({ page: currentPage, limit });

  const toggleBookmarkMutation = useTogglePostBookmark();

  // Extract data from query response
  const bookmarks = bookmarksData?.posts || [];
  const pagination = bookmarksData?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Handle errors
  if (error) {
    console.error("Error fetching bookmarks:", error);
  }

  const removeBookmark = (postId: string) => {
    toggleBookmarkMutation.mutate(postId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-4">
            Start bookmarking articles you want to read later
          </p>
          <Button asChild>
            <Link href="/posts">Browse Articles</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {bookmarks.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {post.featuredImage && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/posts/${post.id}`}
                        className="block group"
                      >
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      {post.excerpt && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.author.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(post.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{post.author.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readingTime} min read</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Bookmarked {formatDistanceToNow(new Date(post.bookmarkedAt))} ago
                          </span>
                        </div>
                      </div>

                      {post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.categories.map(({ category }) => (
                            <Badge key={category.id} variant="secondary">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(post.id)}
                      className="flex-shrink-0"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {bookmarks.length} of {pagination.totalCount} bookmarks
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
