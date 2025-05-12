import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update a category' },
        { status: 401 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get the user to check if they are an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    });

    // Use type assertion to access the role field
    const isAdmin = (user as { role?: string })?.role === 'admin';

    // Allow admins to update any category
    // Otherwise, only allow the creator or default categories to be updated by anyone
    if (!isAdmin && category.createdById !== session.user.id && !category.isDefault) {
      return NextResponse.json(
        { error: 'You can only update your own categories' },
        { status: 403 }
      );
    }

    const { name, description } = await request.json();

    // Check if another category with the same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a category' },
        { status: 401 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Don't allow deletion of default categories
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Default categories cannot be deleted' },
        { status: 403 }
      );
    }

    // Get the user to check if they are an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
    });

    // Use type assertion to access the role field
    const isAdmin = (user as { role?: string })?.role === 'admin';

    // Allow admins to delete any non-default category
    // Otherwise, only allow the creator to delete the category
    if (!isAdmin && category.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own categories' },
        { status: 403 }
      );
    }

    // Don't allow deletion if the category has posts
    if (category.posts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a category that has posts' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
