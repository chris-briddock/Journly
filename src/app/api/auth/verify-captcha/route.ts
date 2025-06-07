import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaService } from '@/lib/services/recaptcha-service';
import { z } from 'zod';

const verifyCaptchaSchema = z.object({
  token: z.string().min(1, 'reCAPTCHA token is required'),
});

// POST /api/auth/verify-captcha - Verify reCAPTCHA token
export async function POST(request: NextRequest) {
  try {
    // Check if reCAPTCHA is enabled
    if (!RecaptchaService.isEnabled()) {
      return NextResponse.json(
        { error: 'reCAPTCHA is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validationResult = verifyCaptchaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Get client IP for additional verification
    const clientIP = RecaptchaService.getClientIP(request);

    // Verify the reCAPTCHA token
    const verificationResult = await RecaptchaService.verifyToken(token, clientIP);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'reCAPTCHA verified successfully',
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
