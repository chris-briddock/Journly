"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import PostForm from "@/app/components/PostForm";
import { useCategories } from "@/hooks/use-categories";

export default function NewPostPage() {
  const { data: session, status } = useSession();

  // Use TanStack Query to fetch categories
  const { data: categories, isLoading, error } = useCategories({ dashboard: true });

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/dashboard/posts">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Posts
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Create Post</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
              <CardDescription>
                Fill in the details below to create a new post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!session) {
    redirect("/login");
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/dashboard/posts">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Posts
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Create Post</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
              <CardDescription>
                Fill in the details below to create a new post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-red-500">
                Failed to load categories. Please try again later.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/posts">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Posts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm categories={categories || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
