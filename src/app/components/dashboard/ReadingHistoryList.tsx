"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, CheckCircle, Loader2, BookOpenCheck } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/app/components/ui/pagination";
import { EmptyPlaceholder } from "@/app/components/EmptyPlaceholder";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { useReadingHistory } from "@/hooks/use-reading-history";



export function ReadingHistoryList() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Use TanStack Query hook
  const {
    data: readingHistoryData,
    isLoading,
    error
  } = useReadingHistory({ page: currentPage, limit });

  // Extract data from query response
  const history = readingHistoryData?.items || [];
  const pagination = readingHistoryData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  // Handle errors
  if (error) {
    console.error("Error fetching reading history:", error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon>
          <BookOpen className="h-8 w-8" />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No reading history</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You haven&apos;t read any posts yet. Start reading to track your progress.
        </EmptyPlaceholder.Description>
        <EmptyPlaceholder.Action>
          <Button asChild>
            <Link href="/posts">Browse Posts</Link>
          </Button>
        </EmptyPlaceholder.Action>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-40 w-full">
              {item.post.featuredImage ? (
                <Image
                  src={item.post.featuredImage}
                  alt={item.post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {item.completed && (
                <div className="absolute right-2 top-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                </div>
              )}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-2 text-lg">
                <Link href={`/posts/${item.post.id}`} className="hover:underline">
                  {item.post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{item.post.readingTime} min read</span>
                <span className="text-muted-foreground">•</span>
                <span>
                  Last read {formatDistanceToNow(new Date(item.lastRead), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(item.progress)}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/posts/${item.post.id}`}>
                  {item.completed ? (
                    <>
                      <BookOpenCheck className="mr-2 h-4 w-4" />
                      Read Again
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Reading
                    </>
                  )}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

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
