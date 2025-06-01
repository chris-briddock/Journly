import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  validateTwoFactorSetup,
  encrypt,
  generateBackupCodes,
  encryptBackupCodes
} from '@/lib/two-factor';
import { z } from 'zod';

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

// Validation schema
const verifySetupSchema = z.object({
  token: z.string().min(6, 'Token must be at least 6 characters').max(6, 'Token must be exactly 6 characters'),
  secret: z.string().min(1, 'Secret is required'), // Keep secret for now until we implement proper session storage
});

// POST /api/auth/2fa/verify-setup - Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifySetupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { token, secret } = validationResult.data;
    const userId = session.user.id as string;

    // Verify the token against the secret
    if (!validateTwoFactorSetup(token, secret)) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const encryptedBackupCodes = encryptBackupCodes(backupCodes);

    // Encrypt the secret for storage
    const encryptedSecret = encrypt(secret);

    // Update user with 2FA settings (using raw query to avoid Prisma type issues)
    await prisma.$executeRaw`
      UPDATE "User"
      SET "twoFactorEnabled" = true,
          "twoFactorSecret" = ${encryptedSecret},
          "backupCodes" = ${encryptedBackupCodes}
      WHERE "id" = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled',
      backupCodes, // Return unencrypted codes for user to save
    });

  } catch (error) {
    console.error('[2FA Verify Setup] Error enabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
