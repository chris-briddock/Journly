import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { postCount: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a category' },
        { status: 401 }
      );
    }

    const { name, description, isDefault } = await request.json();

    // Get the user to check if they are an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
    });

    // Use type assertion to access the role field
    const isAdmin = (user as { role?: string })?.role === 'admin';

    // Only admins can create default categories
    if (isDefault && !isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can create default categories' },
        { status: 403 }
      );
    }

    // Check if category with the same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        isDefault: isAdmin ? (isDefault || false) : false,
        createdById: session.user.id as string,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
