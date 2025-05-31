import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validatePasswordResetToken } from '@/lib/auth-tokens';

// Rate limiting for password reset attempts
const resetAttemptCache = new Map<string, { count: number; resetTime: number }>();

function checkResetRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // Max 5 attempts per 15 minutes

  const record = resetAttemptCache.get(ip);

  if (!record || now > record.resetTime) {
    resetAttemptCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required')
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkResetRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Too many password reset attempts. Please try again in 15 minutes.',
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
    const validationResult = resetPasswordSchema.safeParse(body);

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

    const { token, password } = validationResult.data;

    // Validate the reset token
    const tokenValidation = await validatePasswordResetToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          error: tokenValidation.error || 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    const userId = tokenValidation.userId!;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the user's password
      await tx.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Mark the token as used
      await tx.passwordResetToken.updateMany({
        where: { token },
        data: { used: true }
      });

      // Clean up any other unused tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: {
          userId,
          used: false,
          token: { not: token }
        }
      });
    });

    console.log('[Auth] Password reset successful for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });

  } catch (error) {
    console.error('[Auth] Unexpected error in password reset:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to validate token without resetting password
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          error: 'Reset token is required',
          code: 'MISSING_TOKEN'
        },
        { status: 400 }
      );
    }

    // Validate the reset token
    const tokenValidation = await validatePasswordResetToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: tokenValidation.error || 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Reset token is valid',
    });

  } catch (error) {
    console.error('[Auth] Error validating reset token:', error);

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
