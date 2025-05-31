import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { validateEmailVerificationToken } from '@/lib/auth-tokens';
import { sendWelcomeEmail } from '@/lib/email';

// Rate limiting for verification attempts
const verificationAttemptCache = new Map<string, { count: number; resetTime: number }>();

function checkVerificationRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Max 10 attempts per 15 minutes

  const record = verificationAttemptCache.get(ip);

  if (!record || now > record.resetTime) {
    verificationAttemptCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Validation schema
const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required')
    .trim(),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkVerificationRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again in 15 minutes.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        {
          status: 429,
          headers: {
            'Retry-After': '900' // 15 minutes
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Validate the verification token
    const tokenValidation = await validateEmailVerificationToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          error: tokenValidation.error || 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    const { userId, email } = tokenValidation;

    // Verify the email in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Update the user's email verification status
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date(),
          email: email, // Ensure email matches the token
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true
        }
      });

      // Mark the token as used
      await tx.emailVerificationToken.updateMany({
        where: { token },
        data: { used: true }
      });

      // Clean up any other unused tokens for this user
      await tx.emailVerificationToken.deleteMany({
        where: {
          userId,
          used: false,
          token: { not: token }
        }
      });

      return updatedUser;
    });

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.name || undefined).catch(error => {
      console.error('[Auth] Failed to send welcome email:', error);
    });

    console.log('[Auth] Email verification successful for user:', {
      userId: user.id,
      email: user.email
    });

    return NextResponse.json({
      success: true,
      message: 'Your email has been verified successfully! Welcome to Journly.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('[Auth] Unexpected error in email verification:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to validate token without verifying email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          error: 'Verification token is required',
          code: 'MISSING_TOKEN'
        },
        { status: 400 }
      );
    }

    // Validate the verification token
    const tokenValidation = await validateEmailVerificationToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: tokenValidation.error || 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    // Get user info for the token
    const user = await prisma.user.findUnique({
      where: { id: tokenValidation.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Verification token is valid',
      user: {
        name: user.name,
        email: tokenValidation.email,
        alreadyVerified: !!user.emailVerified
      }
    });

  } catch (error) {
    console.error('[Auth] Error validating verification token:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
