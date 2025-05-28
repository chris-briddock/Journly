import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Search users API endpoint
 *
 * GET /api/users/search?q=query&limit=10
 *
 * This endpoint allows searching for users by name or email
 * It's used for the mention feature in the rich text editor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build the where clause for searching users
    const where: Record<string, unknown> = {};

    if (query) {
      // Search by name or email (case insensitive)
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }
    // If no query, we'll return recent users (no additional where clause needed)

    // Find users matching the query
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: query ? {
        name: 'asc', // Sort by name when searching
      } : {
        createdAt: 'desc', // Show recent users when no query
      },
    });

    // Format the users for the mention feature
    const formattedUsers = users.map(user => ({
      id: user.id,
      label: user.name || user.email?.split('@')[0] || 'Unknown User',
      avatar: user.image || null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
