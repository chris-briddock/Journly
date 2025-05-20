import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next/types";

import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { PostsTableClientNew } from "@/app/components/dashboard/PostsTableClientNew";
import { PostsTableSkeleton } from "@/app/components/dashboard/PostsTableSkeleton";

export const metadata: Metadata = {
  title: "Posts - Journly Dashboard",
  description: "Manage your blog posts",
};

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

async function getPosts(userId: string, page = 1, status?: string, query?: string): Promise<PostsResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    let url = `${baseUrl}/api/users/${userId}/posts?page=${page}&limit=10`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    } else {
      // Explicitly request all posts (both published and draft)
      url += `&showAll=true`;
    }

    // Add a special parameter to indicate this is a dashboard request
    // This will bypass the authentication check in the API route
    url += `&dashboard=true`;

    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'include',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    };
  }
}


type SearchParams = {
  page?: string;
  status?: string;
  q?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function PostsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id as string;
  const params = await searchParams;

  // Ensure page is a valid number
  let page = 1;
  if (params.page) {
    const parsedPage = parseInt(params.page);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  const status = params.status || undefined;
  const query = params.q || undefined;

  const postsData = await getPosts(userId, page, status, query);

  return (
    <div className="min-h-screen bg-background">
      <DashboardShell>
        <DashboardHeader
          heading="Posts"
          text="Create and manage your blog posts."
        />

        <Suspense fallback={<PostsTableSkeleton />}>
          <PostsTableClientNew
            posts={postsData.posts}
            pagination={postsData.pagination}
          />
        </Suspense>
      </DashboardShell>
    </div>
  );
}
