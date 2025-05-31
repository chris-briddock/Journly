import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/auth-tokens';
import { sendPasswordResetEmail } from '@/lib/email';

// Rate limiting - simple in-memory store (in production, use Redis)
const resetRequestCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3; // Max 3 requests per 15 minutes

  const record = resetRequestCache.get(ip);
  
  if (!record || now > record.resetTime) {
    resetRequestCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: 'Too many password reset requests. Please try again in 15 minutes.',
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
    const validationResult = forgotPasswordSchema.safeParse(body);

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

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true, // Check if user has a password (not OAuth-only)
      }
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists and has a password
    if (user && user.password) {
      try {
        // Create password reset token
        const resetToken = await createPasswordResetToken(user.id);

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(
          user.email,
          resetToken,
          user.name || undefined
        );

        if (!emailResult.success) {
          console.error('[Auth] Failed to send password reset email:', emailResult.error);
          // Don't expose email sending errors to the client
        } else {
          console.log('[Auth] Password reset email sent successfully:', {
            userId: user.id,
            email: user.email,
            emailId: emailResult.id
          });
        }
      } catch (error) {
        console.error('[Auth] Error in password reset process:', error);
        // Continue to return success to prevent information disclosure
      }
    } else if (user && !user.password) {
      // User exists but uses OAuth - log this for monitoring
      console.log('[Auth] Password reset requested for OAuth-only user:', {
        userId: user.id,
        email: user.email
      });
    } else {
      // User doesn't exist - log this for monitoring
      console.log('[Auth] Password reset requested for non-existent email:', email);
    }

    // Always return success response to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent you a password reset link.',
    });

  } catch (error) {
    console.error('[Auth] Unexpected error in forgot password:', error);
    
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
