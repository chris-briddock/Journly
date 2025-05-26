import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next/types";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import PostForm from "@/app/components/PostForm";
import { getApiUrl } from "@/lib/getApiUrl";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  authorId: string;
  categoryIds: string[];
  scheduledPublishAt?: string | null;
  // SEO fields
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoCanonicalUrl?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
}

interface Category {
  id: string;
  name: string;
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  return {
    title: post ? `Edit ${post.title} - Journly` : "Edit Post - Journly",
  };
}

async function getPost(id: string): Promise<Post | null> {
  try {
    // Add a dashboard parameter to indicate this is a dashboard request
    const url = getApiUrl(`/api/posts/${id}/edit?dashboard=true`);
    console.log('Fetching post with URL:', url);

    // During build time, return not found to prevent API calls
    if (!url) {
      console.log('[Build] Skipping post fetch during static generation');
      notFound();
    }

    const response = await fetch(url, {
      // Use next.js cache instead of no-store to allow static rendering
      next: { revalidate: 0 }, // Revalidate every 60 seconds
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Fetch response status:', response.status);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error('Failed to fetch post');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    // Add a dashboard parameter to indicate this is a dashboard request
    const url = '/api/categories/editor?dashboard=true';
    console.log('Fetching categories with URL:', url);

    const response = await fetch(url, {
      // Use next.js cache instead of no-store to allow static rendering
      // This will be revalidated when categories are updated
      next: { revalidate: 0 }, // Revalidate every 60 seconds
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Categories fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Categories API error response:', errorText);
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function EditPostPage({ params }: Props) {
  const session = await auth();

  // Debug session information
  console.log('Edit Page - Session:', session ? 'exists' : 'null');
  console.log('Edit Page - User:', session?.user ? `ID: ${session.user.id}` : 'null');

  if (!session) {
    console.log('Edit Page - No session, redirecting to login');
    redirect("/login");
  }

  const { id } = await params;
  console.log('Edit Page - Post ID:', id);

  const [post, categories] = await Promise.all([
    getPost(id),
    getCategories(),
  ]);

  console.log('Edit Page - Post fetched:', post ? 'success' : 'null');
  console.log('Edit Page - Categories fetched:', categories.length);

  if (!post) {
    console.log('Edit Page - Post not found');
    notFound();
  }

  // Check if the user is the author of the post
  console.log('Edit Page - Author check:', `Post author: ${post.authorId}, User: ${session.user?.id}`);
  if (post.authorId !== session.user?.id) {
    console.log('Edit Page - User is not the author, redirecting');
    redirect("/dashboard/posts");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/posts">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Posts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
            <CardDescription>
              Update your post details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm
              initialData={{
                id: post.id,
                title: post.title,
                content: post.content,
                excerpt: post.excerpt || "",
                featuredImage: post.featuredImage || "",
                status: post.status,
                categoryIds: post.categoryIds,
                scheduledPublishAt: post.scheduledPublishAt || undefined,
                // SEO fields
                seoTitle: post.seoTitle || "",
                seoDescription: post.seoDescription || "",
                seoKeywords: post.seoKeywords || "",
                seoCanonicalUrl: post.seoCanonicalUrl || "",
                ogImage: post.ogImage || "",
                noIndex: post.noIndex || false,
              }}
              categories={categories}
              isEditing
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
