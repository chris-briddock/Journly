import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateBackupCodes, encryptBackupCodes } from '@/lib/two-factor';
import { z } from 'zod';

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

// Validation schema
const regenerateBackupCodesSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/2fa/backup-codes - Generate new backup codes
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
    const validationResult = regenerateBackupCodesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;
    const userId = session.user.id as string;

    // Get user with password for verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'This account does not have a password set' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA must be enabled to generate backup codes' },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    const encryptedBackupCodes = encryptBackupCodes(backupCodes);

    // Update user with new backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: encryptedBackupCodes,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'New backup codes have been generated',
      backupCodes, // Return unencrypted codes for user to save
    });

  } catch (error) {
    console.error('[2FA Backup Codes] Error generating backup codes:', error);
    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}
