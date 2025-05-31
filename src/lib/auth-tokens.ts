import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Generate a secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // Clean up any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId }
  });

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    }
  });

  return token;
}

/**
 * Validate and consume a password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return { valid: false, error: 'Invalid or expired reset token' };
    }

    if (resetToken.used) {
      return { valid: false, error: 'This reset token has already been used' };
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      return { valid: false, error: 'Reset token has expired' };
    }

    return { valid: true, userId: resetToken.userId };
  } catch (error) {
    console.error('[Auth] Error validating password reset token:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
}

/**
 * Mark a password reset token as used
 */
export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: { token },
    data: { used: true }
  });
}

/**
 * Create an email verification token
 */
export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  // Clean up any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId }
  });

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      email,
      expiresAt,
    }
  });

  return token;
}

/**
 * Validate and consume an email verification token
 */
export async function validateEmailVerificationToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return { valid: false, error: 'Invalid or expired verification token' };
    }

    if (verificationToken.used) {
      return { valid: false, error: 'This verification token has already been used' };
    }

    if (verificationToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return { valid: false, error: 'Verification token has expired' };
    }

    return { 
      valid: true, 
      userId: verificationToken.userId,
      email: verificationToken.email
    };
  } catch (error) {
    console.error('[Auth] Error validating email verification token:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
}

/**
 * Mark an email verification token as used
 */
export async function markEmailVerificationTokenAsUsed(token: string): Promise<void> {
  await prisma.emailVerificationToken.updateMany({
    where: { token },
    data: { used: true }
  });
}

/**
 * Clean up expired tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  
  try {
    // Clean up expired password reset tokens
    const expiredPasswordTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    // Clean up expired email verification tokens
    const expiredEmailTokens = await prisma.emailVerificationToken.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    console.log('[Auth] Cleaned up expired tokens:', {
      passwordResetTokens: expiredPasswordTokens.count,
      emailVerificationTokens: expiredEmailTokens.count
    });
  } catch (error) {
    console.error('[Auth] Error cleaning up expired tokens:', error);
  }
}

/**
 * Check if user has pending email verification
 */
export async function hasPendingEmailVerification(userId: string): Promise<boolean> {
  const pendingToken = await prisma.emailVerificationToken.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: { gt: new Date() }
    }
  });

  return !!pendingToken;
}

/**
 * Check if user has pending password reset
 */
export async function hasPendingPasswordReset(userId: string): Promise<boolean> {
  const pendingToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: { gt: new Date() }
    }
  });

  return !!pendingToken;
}
