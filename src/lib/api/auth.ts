import { apiPost, apiGet } from '@/lib/api-client';

// Types for authentication API responses
export interface ForgotPasswordRequest extends Record<string, unknown> {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest extends Record<string, unknown> {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export interface VerifyEmailRequest extends Record<string, unknown> {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
  };
}

export interface ValidateVerificationTokenResponse {
  valid: boolean;
  message?: string;
  error?: string;
  code?: string;
  user?: {
    name?: string;
    email?: string;
    alreadyVerified?: boolean;
  };
}

export interface ResendVerificationRequest extends Record<string, unknown> {
  email?: string; // Optional if user is authenticated
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * Request password reset email
 */
export function requestPasswordReset(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiPost<ForgotPasswordResponse>('/api/auth/forgot-password', data);
}

/**
 * Reset password with token
 */
export function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiPost<ResetPasswordResponse>('/api/auth/reset-password', data);
}

/**
 * Validate password reset token
 */
export function validateResetToken(token: string): Promise<ValidateResetTokenResponse> {
  return apiGet<ValidateResetTokenResponse>('/api/auth/reset-password', { token });
}

/**
 * Verify email address with token
 */
export function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  return apiPost<VerifyEmailResponse>('/api/auth/verify-email', data);
}

/**
 * Validate email verification token
 */
export function validateVerificationToken(token: string): Promise<ValidateVerificationTokenResponse> {
  return apiGet<ValidateVerificationTokenResponse>('/api/auth/verify-email', { token });
}

/**
 * Resend email verification
 */
export function resendVerification(data: ResendVerificationRequest): Promise<ResendVerificationResponse> {
  return apiPost<ResendVerificationResponse>('/api/auth/resend-verification', data);
}
