import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/app/components/ui/button";
import PostCard from "@/app/components/PostCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/app/components/ui/pagination";
import SimpleNavigation from "@/app/components/SimpleNavigation";

type SearchParams = {
  page?: string;
};

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

async function getUserPosts(userId: string, page: number) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: userId,
        status: "published",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: {
        authorId: userId,
        status: "published",
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export default async function UserPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const searchParamsValue = await searchParams;

  const page = Number(searchParamsValue.page) || 1;

  const [user, { posts, pagination }] = await Promise.all([
    getUser(id),
    getUserPosts(id, page),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigation />
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
                <PostCard key={post.id} post={post} />
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
