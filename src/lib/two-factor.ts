import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data like 2FA secrets
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data like 2FA secrets
 */
export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encrypted = textParts[1];

  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a new 2FA secret for a user
 */
export function generateTwoFactorSecret(userEmail: string, serviceName: string = 'Journly') {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32,
  });

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url,
  };
}

/**
 * Generate QR code data URL for the secret
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    const decryptedSecret = decrypt(secret);
    
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Encrypt backup codes for storage
 */
export function encryptBackupCodes(codes: string[]): string[] {
  return codes.map(code => encrypt(code));
}

/**
 * Decrypt backup codes for verification
 */
export function decryptBackupCodes(encryptedCodes: string[]): string[] {
  return encryptedCodes.map(code => decrypt(code));
}

/**
 * Verify a backup code against stored codes
 */
export function verifyBackupCode(inputCode: string, encryptedCodes: string[]): boolean {
  try {
    const decryptedCodes = decryptBackupCodes(encryptedCodes);
    return decryptedCodes.includes(inputCode.toUpperCase());
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

/**
 * Remove a used backup code from the list
 */
export function removeUsedBackupCode(usedCode: string, encryptedCodes: string[]): string[] {
  try {
    const decryptedCodes = decryptBackupCodes(encryptedCodes);
    const filteredCodes = decryptedCodes.filter(code => code !== usedCode.toUpperCase());
    return encryptBackupCodes(filteredCodes);
  } catch (error) {
    console.error('Error removing backup code:', error);
    return encryptedCodes;
  }
}

/**
 * Check if user has 2FA enabled and configured
 */
export function isTwoFactorEnabled(user: { twoFactorEnabled: boolean; twoFactorSecret: string | null }): boolean {
  return user.twoFactorEnabled && !!user.twoFactorSecret;
}

/**
 * Validate 2FA setup data
 */
export function validateTwoFactorSetup(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }

  // Verify the token against the secret
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2,
  });
}
