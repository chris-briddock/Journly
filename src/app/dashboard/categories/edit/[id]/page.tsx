import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next/types";

import { getCategory as getCategoryApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import CategoryForm from "@/app/components/CategoryForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategory(id);

  return {
    title: category ? `Edit ${category.name} - Journly` : "Edit Category - Journly",
  };
}

async function getCategory(id: string) {
  return await getCategoryApi(id);
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
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
