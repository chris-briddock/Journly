'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import CategoryForm from "@/app/components/CategoryForm";
import { useCategory } from "@/hooks/use-categories";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditCategoryPage({ params }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  // Use React.use() to avoid hook order issues
  const { id } = React.use(params);

  const { data: category, isLoading, error } = useCategory(id, !!id);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/dashboard/categories">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Categories
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Category</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>
                Update the category details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/dashboard/categories">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Categories
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Category</h1>
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500">Category not found or failed to load.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/categories">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Category</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Update the category details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm
              initialData={{
                id: category.id,
                name: category.name,
                description: category.description || "",
              }}
              isEditing
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
