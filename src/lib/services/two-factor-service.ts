import { apiGet, apiPost } from '@/lib/api-client';

// Types for 2FA API responses
export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
}

export interface TwoFactorVerifySetupRequest {
  token: string;
  secret: string;
  [key: string]: unknown;
}

export interface TwoFactorVerifySetupResponse {
  message: string;
  backupCodes: string[];
}

export interface TwoFactorDisableRequest {
  password: string;
  [key: string]: unknown;
}

export interface TwoFactorDisableResponse {
  message: string;
}

export interface TwoFactorBackupCodesRequest {
  password: string;
  [key: string]: unknown;
}

export interface TwoFactorBackupCodesResponse {
  backupCodes: string[];
  message: string;
}

export interface TwoFactorVerifyRequest {
  userId: string;
  token: string;
  isBackupCode?: boolean;
  [key: string]: unknown;
}

export interface TwoFactorVerifyResponse {
  message: string;
}

/**
 * Two-Factor Authentication Service
 * Handles all 2FA-related API calls
 */
export class TwoFactorService {
  /**
   * Get 2FA setup data (secret and QR code)
   */
  static async getSetupData(): Promise<TwoFactorSetupResponse> {
    return apiGet<TwoFactorSetupResponse>('/api/auth/2fa/setup');
  }

  /**
   * Verify and enable 2FA
   */
  static async verifySetup(data: TwoFactorVerifySetupRequest): Promise<TwoFactorVerifySetupResponse> {
    return apiPost<TwoFactorVerifySetupResponse>('/api/auth/2fa/verify-setup', data);
  }

  /**
   * Disable 2FA
   */
  static async disable(data: TwoFactorDisableRequest): Promise<TwoFactorDisableResponse> {
    return apiPost<TwoFactorDisableResponse>('/api/auth/2fa/disable', data);
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(data: TwoFactorBackupCodesRequest): Promise<TwoFactorBackupCodesResponse> {
    return apiPost<TwoFactorBackupCodesResponse>('/api/auth/2fa/backup-codes', data);
  }

  /**
   * Verify 2FA token during login
   */
  static async verifyToken(data: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse> {
    return apiPost<TwoFactorVerifyResponse>('/api/auth/2fa/verify', data);
  }
}
