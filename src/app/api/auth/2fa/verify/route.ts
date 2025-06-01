import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  verifyTwoFactorToken, 
  verifyBackupCode, 
  removeUsedBackupCode 
} from '@/lib/two-factor';
import { z } from 'zod';

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

// Validation schema
const verifyTwoFactorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token: z.string().min(1, 'Token is required'),
  isBackupCode: z.boolean().optional().default(false),
});

// POST /api/auth/2fa/verify - Verify 2FA token during login
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyTwoFactorSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId, token, isBackupCode } = validationResult.data;

    // Get user with 2FA settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this user' },
        { status: 400 }
      );
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = verifyBackupCode(token, user.backupCodes);
      
      if (isValid) {
        // Remove the used backup code
        const updatedBackupCodes = removeUsedBackupCode(token, user.backupCodes);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            backupCodes: updatedBackupCodes,
          },
        });
      }
    } else {
      // Verify TOTP token
      isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
    });

  } catch (error) {
    console.error('[2FA Verify] Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
