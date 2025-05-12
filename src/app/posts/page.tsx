import Link from "next/link";
import { Suspense } from "react";
import { Filter } from "lucide-react";

import { getPosts as getPostsApi, getCategories as getCategoriesApi } from "@/lib/api";
import Navigation from "@/app/components/Navigation";
import PostCard from "@/app/components/PostCard";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";

type SearchParams = {
  categoryId?: string;
  page?: string;
};

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    }
  }>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  postCount: number;
}

async function getPosts(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;

  return await getPostsApi({
    page,
    limit,
    categoryId: searchParams.categoryId,
    status: 'published'
  });
}

async function getCategories() {
  return await getCategoriesApi();
}

export default async function PostsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await the searchParams before using it
  const searchParams = await searchParamsPromise;

  const [{ posts, pagination }, categories] = await Promise.all([
    getPosts(searchParams),
    getCategories(),
  ]);

  const selectedCategoryId = searchParams.categoryId;
  const selectedCategory = selectedCategoryId
    ? categories.find((c: Category) => c.id === selectedCategoryId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
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
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">
                  {selectedCategory
                    ? `${selectedCategory.name} Posts`
                    : "All Posts"}
                </h1>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
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
                    {posts.map((post: Post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </Suspense>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const pageNumber = i + 1;
                      const isCurrentPage = pageNumber === pagination.page;
                      const href = `/posts?page=${pageNumber}${
                        selectedCategoryId
                          ? `&categoryId=${selectedCategoryId}`
                          : ""
                      }`;

                      return (
                        <Button
                          key={pageNumber}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          asChild
                        >
                          <Link href={href}>{pageNumber}</Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
