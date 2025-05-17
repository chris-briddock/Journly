import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import CategoryList from "@/app/components/CategoryList";

interface Category {
  id: string;
  name: string;
  description: string | null;
  postCount: number;
  isDefault: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

async function getCategories(): Promise<Category[]> {
  try {
    // Add a dashboard parameter to indicate this is a dashboard request
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories/admin?dashboard=true`;
    console.log('Fetching categories with URL:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    console.log('Categories fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Categories API error response:', errorText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const categories = await getCategories();

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
            <CategoryList categories={categories} userId={session.user?.id as string} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
