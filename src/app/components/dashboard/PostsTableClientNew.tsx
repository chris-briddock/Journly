"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/app/components/ui/pagination";
import { DeletePostButtonNew } from "./DeletePostButtonNew";
import { BulkActionMenu } from "./BulkActionMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { usePathname, useSearchParams } from "next/navigation";

interface Post {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string | Date;
  publishedAt: string | Date | null;
  categories?: {
    category: {
      id: string;
      name: string;
    };
  }[];
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

export function PostsTableClientNew({
  posts,
  pagination,
  disableNewPost = false
}: {
  posts: Post[];
  pagination: PostsResponse['pagination'];
  disableNewPost?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page = 1, totalPages = 1 } = pagination;
  const currentStatus = searchParams.get("status") || 'all';
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle search query change
  useEffect(() => {
    // Only update the URL when the debounced search query changes
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearchQuery) {
      params.set("q", debouncedSearchQuery);
    } else {
      params.delete("q");
    }

    // Always reset to page 1 when searching
    params.set("page", "1");

    // Only update if the query param actually changed
    if (debouncedSearchQuery !== searchParams.get("q")) {
      router.replace(`${pathname}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, router, pathname]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Form */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="w-full md:w-[200px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BulkActionMenu
            selectedIds={selectedPosts}
            onActionComplete={clearSelection}
            disabled={selectedPosts.length === 0}
          />
          {disableNewPost ? (
            <Button asChild variant="outline" disabled>
              <span>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </span>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/posts/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No posts found</p>
            {disableNewPost ? (
              <Button variant="outline" disabled>
                Create your first post
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/posts/new">Create your first post</Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Posts List */}
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">
                <Checkbox
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    handleSelectAll(checked === true)}
                  aria-label="Select all posts"
                />
              </div>
              <div className="col-span-5">Title</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Views</div>
              <div className="col-span-1 text-center">Likes</div>
              <div className="col-span-1 text-center">Comments</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Post Rows */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-md border items-center hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      handleSelectPost(post.id, checked === true)}
                    aria-label={`Select post ${post.title}`}
                  />
                </div>
                <div className="col-span-5 font-medium truncate">
                  <Link
                    href={`/dashboard/posts/edit/${post.id}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="col-span-1 flex justify-center">
                  <Badge
                    variant={
                      post.status === "published"
                        ? "success"
                        : post.status === "scheduled"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {post.status === "published"
                      ? "Published"
                      : post.status === "scheduled"
                        ? "Scheduled"
                        : "Draft"
                    }
                  </Badge>
                </div>
                <div className="col-span-1 text-center">{post.viewCount}</div>
                <div className="col-span-1 text-center">{post.likeCount}</div>
                <div className="col-span-1 text-center">{post.commentCount}</div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                    title={post.status === 'published' ? 'View published post' : 'Preview draft post'}
                  >
                    <Link href={post.status === 'published' ? `/posts/${post.id}` : `/posts/${post.id}/preview`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={`/dashboard/posts/edit/${post.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeletePostButtonNew postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <Link
                      href={`${pathname}?${(() => { const params = new URLSearchParams(searchParams.toString()); params.set('page', (page - 1).toString()); return params.toString(); })()}`}
                      className="flex items-center gap-1 px-2.5 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Link>
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <Link
                      href={`${pathname}?${(() => { const params = new URLSearchParams(searchParams.toString()); params.set('page', pageNum.toString()); return params.toString(); })()}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${pageNum === page ? 'border border-input bg-background' : 'hover:bg-accent hover:text-accent-foreground'}`}
                      aria-current={pageNum === page ? "page" : undefined}
                    >
                      {pageNum}
                    </Link>
                  </PaginationItem>
                ))}

                {page < totalPages && (
                  <PaginationItem>
                    <Link
                      href={`${pathname}?${(() => { const params = new URLSearchParams(searchParams.toString()); params.set('page', (page + 1).toString()); return params.toString(); })()}`}
                      className="flex items-center gap-1 px-2.5 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
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