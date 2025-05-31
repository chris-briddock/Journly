import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const checkUserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Check if a user exists and their email verification status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = checkUserSchema.parse(body);

    console.log('[Auth] Checking user verification status for:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        emailVerified: false,
      });
    }

    // Check if user has a password (can use credentials login)
    if (!user.password) {
      return NextResponse.json({
        exists: true,
        emailVerified: !!user.emailVerified,
        hasPassword: false,
      });
    }

    return NextResponse.json({
      exists: true,
      emailVerified: !!user.emailVerified,
      hasPassword: true,
    });

  } catch (error) {
    console.error('[Auth] Error checking user verification status:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
