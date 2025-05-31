import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/auth-tokens';
import { sendEmailVerificationEmail } from '@/lib/email';

// Rate limiting for resend verification requests
const resendRequestCache = new Map<string, { count: number; resetTime: number }>();

function checkResendRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 3;

  const record = resendRequestCache.get(identifier);

  if (!record || now > record.resetTime) {
    resendRequestCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Validation schema
const resendVerificationSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .optional(), // Optional if user is authenticated
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting (currently unused but kept for future rate limiting by IP)
    // const ip = request.headers.get('x-forwarded-for') ||
    //            request.headers.get('x-real-ip') ||
    //            'unknown';

    // Check if user is authenticated
    const session = await auth();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = resendVerificationSchema.safeParse(body);

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

    let email: string;
    let userId: string;

    if (session?.user?.id) {
      // User is authenticated - use their email
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true
        }
      });

      if (!user) {
        return NextResponse.json(
          {
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      if (user.emailVerified) {
        return NextResponse.json(
          {
            error: 'Your email is already verified',
            code: 'ALREADY_VERIFIED'
          },
          { status: 400 }
        );
      }

      email = user.email;
      userId = user.id;
    } else {
      // User is not authenticated - require email in request
      if (!validationResult.data.email) {
        return NextResponse.json(
          {
            error: 'Email is required',
            code: 'EMAIL_REQUIRED'
          },
          { status: 400 }
        );
      }

      email = validationResult.data.email;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          emailVerified: true
        }
      });

      if (!user) {
        // Don't reveal if email exists - return success
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists and is unverified, we\'ve sent a verification email.',
        });
      }

      if (user.emailVerified) {
        // Don't reveal if email is already verified - return success
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists and is unverified, we\'ve sent a verification email.',
        });
      }

      userId = user.id;
    }

    // Check rate limit using email as identifier
    if (!checkResendRateLimit(email)) {
      return NextResponse.json(
        {
          error: 'Too many verification emails sent. Please try again in 15 minutes.',
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

    try {
      // Get user details for email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create new verification token
      const verificationToken = await createEmailVerificationToken(userId, email);

      // Send verification email
      const emailResult = await sendEmailVerificationEmail(
        email,
        verificationToken,
        user.name || undefined
      );

      if (!emailResult.success) {
        console.error('[Auth] Failed to send verification email:', emailResult.error);
        throw new Error('Failed to send email');
      }

      console.log('[Auth] Verification email resent successfully:', {
        userId,
        email,
        emailId: emailResult.id
      });

    } catch (error) {
      console.error('[Auth] Error in resend verification process:', error);

      // For authenticated users, we can show the actual error
      if (session?.user?.id) {
        return NextResponse.json(
          {
            error: 'Failed to send verification email. Please try again later.',
            code: 'EMAIL_SEND_FAILED'
          },
          { status: 500 }
        );
      }
      // For unauthenticated users, don't reveal the error
    }

    return NextResponse.json({
      success: true,
      message: session?.user?.id
        ? 'Verification email sent successfully. Please check your inbox.'
        : 'If an account with that email exists and is unverified, we\'ve sent a verification email.',
    });

  } catch (error) {
    console.error('[Auth] Unexpected error in resend verification:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

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
