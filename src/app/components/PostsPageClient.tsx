"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import PostCard from "@/app/components/PostCard";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/app/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { usePosts } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";

interface Category {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  postCount: number;
}



interface PostsPageClientProps {
  searchParams: {
    categoryId?: string;
    page?: string;
  };
}

export default function PostsPageClient({
  searchParams,
}: PostsPageClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  // Update state when searchParams change
  useEffect(() => {
    setPage(Number(searchParams.page) || 1);
    setSelectedCategoryId(searchParams.categoryId);
  }, [searchParams]);

  // Use TanStack Query hooks
  const { data: postsData, isLoading: postsLoading, error: postsError } = usePosts({
    page,
    limit: 12,
    categoryId: selectedCategoryId,
    status: 'published'
  });

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories({ dashboard: false });

  const isLoading = postsLoading || categoriesLoading;
  const error = postsError || categoriesError;
  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 };

  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Mobile Categories Dropdown Skeleton */}
              <div className="md:hidden w-full mb-4">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Desktop Sidebar Skeleton */}
              <div className="hidden md:block w-64 shrink-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Filter posts by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Separator />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1">
                <div className="mb-6">
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Error Loading Posts</h1>
              <p className="text-red-500">Failed to load posts. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Mobile Categories Dropdown */}
            <div className="md:hidden w-full mb-4">
              <Select
                value={selectedCategoryId || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    router.push("/posts");
                  } else {
                    router.push(`/posts?categoryId=${value}`);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.postCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Filter posts by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={!selectedCategoryId ? "default" : "outline"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/posts">All Posts</Link>
                  </Button>
                  <Separator />
                  {categories.map((category: Category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategoryId === category.id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/posts?categoryId=${category.id}`}>
                        {category.name}
                        <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                          {category.postCount}
                        </span>
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">
                  {selectedCategory
                    ? `${selectedCategory.name} Posts`
                    : "All Posts"}
                </h1>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium mb-2">No posts found</h2>
                  <p className="text-muted-foreground">
                    {selectedCategory
                      ? `There are no posts in the ${selectedCategory.name} category yet.`
                      : "There are no posts yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={<div>Loading posts...</div>}>
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                      />
                    ))}
                  </Suspense>
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
                            href={`/posts?page=${pagination.page - 1}${
                              selectedCategoryId
                                ? `&categoryId=${selectedCategoryId}`
                                : ""
                            }`}
                          />
                        </PaginationItem>
                      )}

                      {Array.from({ length: pagination.totalPages }).map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === pagination.page;
                        const href = `/posts?page=${pageNumber}${
                          selectedCategoryId
                            ? `&categoryId=${selectedCategoryId}`
                            : ""
                        }`;

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
                            href={`/posts?page=${pagination.page + 1}${
                              selectedCategoryId
                                ? `&categoryId=${selectedCategoryId}`
                                : ""
                            }`}
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
      </div>
    </div>
  );
}
