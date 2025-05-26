import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Simple in-memory cache for rate limiting
const categoriesRequestCache = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function for categories
function checkCategoriesRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute per IP

  const key = `categories:${ip}`;
  const current = categoriesRequestCache.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    categoriesRequestCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkCategoriesRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { postCount: 'desc' },
        { name: 'asc' },
      ],
    });

    // Add cache headers
    const response = NextResponse.json(categories);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
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
