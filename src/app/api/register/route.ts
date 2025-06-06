import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createFreeSubscription } from '@/lib/services/subscription-service';
import { createEmailVerificationToken } from '@/lib/auth-tokens';
import { sendEmailVerificationEmail } from '@/lib/email';
import { RecaptchaService } from '@/lib/services/recaptcha-service';

// Force Node.js runtime for subscription service compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, recaptchaToken } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if enabled
    if (RecaptchaService.isEnabled()) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'Please complete the reCAPTCHA verification' },
          { status: 400 }
        );
      }

      const clientIP = RecaptchaService.getClientIP(request);
      const captchaResult = await RecaptchaService.verifyToken(recaptchaToken, clientIP);

      if (!captchaResult.success) {
        return NextResponse.json(
          { error: captchaResult.error || 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Email is not verified yet
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Create a free subscription for the new user
    await createFreeSubscription(user.id);

    // Send email verification
    try {
      const verificationToken = await createEmailVerificationToken(user.id, user.email);
      const emailResult = await sendEmailVerificationEmail(
        user.email,
        verificationToken,
        user.name || undefined
      );

      if (!emailResult.success) {
        console.error('[Registration] Failed to send verification email:', emailResult.error);
        // Don't fail registration if email fails - user can resend later
      } else {
        console.log('[Registration] Verification email sent successfully:', {
          userId: user.id,
          email: user.email,
          emailId: emailResult.id
        });
      }
    } catch (emailError) {
      console.error('[Registration] Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      ...user,
      message: 'Account created successfully! Please check your email to verify your account.',
      emailVerificationSent: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
