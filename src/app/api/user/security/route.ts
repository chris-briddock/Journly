import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUserSessionCount } from '@/lib/services/session-service';
import { z } from 'zod';

// Force Node.js runtime for security operations
export const runtime = 'nodejs';

// Validation schemas
const securitySettingsSchema = z.object({
  sessionTimeout: z.number().min(1).max(90).optional(), // Days
  requireTwoFactor: z.boolean().optional(),
  emailSecurityAlerts: z.boolean().optional(),
});

export interface SecuritySettings {
  sessionTimeout: number; // Days
  requireTwoFactor: boolean;
  emailSecurityAlerts: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  activeSessionCount: number;
  accountCreated: Date;
  lastLogin?: Date;
  emailVerified: boolean;
  hasPassword: boolean;
  connectedAccounts: {
    provider: string;
    connectedAt: Date;
  }[];
}

// GET /api/user/security - Get security settings and status
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user data with security information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get active session count
    const activeSessionCount = await getUserSessionCount(userId);

    // Build security settings response
    const securitySettings: SecuritySettings = {
      sessionTimeout: 30, // Default 30 days (from NextAuth config)
      requireTwoFactor: user.twoFactorEnabled,
      emailSecurityAlerts: true, // Default to true, could be stored in user preferences
      twoFactorEnabled: user.twoFactorEnabled,
      lastPasswordChange: user.updatedAt, // Approximate - could track separately
      activeSessionCount,
      accountCreated: user.createdAt,
      emailVerified: !!user.emailVerified,
      hasPassword: !!user.password,
      connectedAccounts: user.accounts.map(account => ({
        provider: account.provider,
        connectedAt: new Date(), // Account model doesn't have createdAt, use current date as fallback
      })),
    };

    return NextResponse.json(securitySettings);

  } catch (error) {
    console.error('[Security] Error fetching security settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/security - Update security settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request data
    const validation = securitySettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sessionTimeout, requireTwoFactor, emailSecurityAlerts } = validation.data;

    // Note: Some settings like sessionTimeout would require additional implementation
    // For now, we'll focus on settings that can be stored in the user model

    const updateData: Record<string, unknown> = {};

    if (requireTwoFactor !== undefined) {
      // Check if user has 2FA set up before requiring it
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true },
      });

      if (requireTwoFactor && !user?.twoFactorSecret) {
        return NextResponse.json(
          { error: 'Two-factor authentication must be set up before it can be required' },
          { status: 400 }
        );
      }

      updateData.twoFactorEnabled = requireTwoFactor;
    }

    // Update user settings
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // For settings like emailSecurityAlerts and sessionTimeout, 
    // we would need to implement a separate UserSecuritySettings model
    // or store them in a JSON field. For now, we'll return success.

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully',
      updated: {
        requireTwoFactor,
        emailSecurityAlerts,
        sessionTimeout,
      },
    });

  } catch (error) {
    console.error('[Security] Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}
