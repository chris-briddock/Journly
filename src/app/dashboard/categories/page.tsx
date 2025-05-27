"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import CategoryList from "@/app/components/CategoryList";
import { useAdminCategories } from "@/hooks/use-categories";

export default function CategoriesPage() {
  const { data: session, status } = useSession();

  // Use TanStack Query to fetch admin categories
  const { data: categories, isLoading, error } = useAdminCategories({ dashboard: true });

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Categories</h1>
            <Button asChild>
              <Link href="/dashboard/categories/new">
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Create and manage categories for your posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
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
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Categories</h1>
            <Button asChild>
              <Link href="/dashboard/categories/new">
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Create and manage categories for your posts
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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>
              Create and manage categories for your posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryList categories={categories || []} userId={session.user?.id as string} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
