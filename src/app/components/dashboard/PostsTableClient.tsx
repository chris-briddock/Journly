"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Plus, Eye } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";
import { PostStatusFilter } from "./PostStatusFilter";
import { PostSearchForm } from "./PostSearchForm";
import { DeletePostButton } from "./DeletePostButton";
import { BulkActionMenu } from "./BulkActionMenu";

interface Post {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  publishedAt: Date | null;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SearchParams {
  page?: string;
  status?: string;
  q?: string;
}

export function PostsTableClient({
  posts,
  pagination,
  searchParams
}: {
  posts: Post[];
  pagination: PostsResponse['pagination'];
  searchParams: SearchParams;
}) {
  const { page = 1, totalPages = 1 } = pagination;
  const currentStatus = searchParams.status || 'all';
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(posts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts((prev: string[]) => [...prev, postId]);
    } else {
      setSelectedPosts((prev: string[]) => prev.filter((id: string) => id !== postId));
    }
  };

  const clearSelection = () => {
    setSelectedPosts([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <PostStatusFilter />
          <PostSearchForm />
        </div>
        <div className="flex items-center gap-2">
          <BulkActionMenu
            selectedIds={selectedPosts}
            onActionComplete={clearSelection}
            disabled={selectedPosts.length === 0}
          />
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No posts found</p>
            <Button asChild>
              <Link href="/dashboard/posts/new">Create your first post</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]">
                    <Checkbox
                      checked={selectedPosts.length === posts.length && posts.length > 0}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleSelectAll(checked === true)}
                      aria-label="Select all posts"
                    />
                  </TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          handleSelectPost(post.id, checked === true)}
                        aria-label={`Select post ${post.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "success" : "secondary"}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.viewCount}</TableCell>
                    <TableCell>{post.likeCount}</TableCell>
                    <TableCell>{post.commentCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/posts/${post.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/dashboard/posts/edit/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/dashboard/posts?page=${page - 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={`/dashboard/posts?page=${pageNum}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/dashboard/posts?page=${page + 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
