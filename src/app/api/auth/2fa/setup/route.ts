import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/two-factor';

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

// GET /api/auth/2fa/setup - Generate 2FA secret and QR code
export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate 2FA secret
    const { secret, qrCodeUrl } = generateTwoFactorSecret(session.user.email!);

    // Generate QR code data URL
    const qrCodeDataUrl = await generateQRCode(qrCodeUrl!);

    return NextResponse.json({
      secret,
      qrCodeDataUrl,
      manualEntryKey: secret,
    });

  } catch (error) {
    console.error('[2FA Setup] Error generating 2FA setup:', error);
    return NextResponse.json(
      { error: 'Failed to generate 2FA setup' },
      { status: 500 }
    );
  }
}
