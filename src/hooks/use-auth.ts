import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  verifyEmail,
  validateVerificationToken,
  resendVerification,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
  type ResendVerificationRequest,
} from '@/lib/api/auth';

/**
 * Hook to request password reset
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => requestPasswordReset(data),
    onError: (error) => {
      console.error('[Auth] Password reset request failed:', error);
    },
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onError: (error) => {
      console.error('[Auth] Password reset failed:', error);
    },
  });
}

/**
 * Hook to validate password reset token
 */
export function useValidateResetToken(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.auth.resetToken(token),
    queryFn: () => validateResetToken(token),
    enabled: enabled && !!token,
    retry: false, // Don't retry token validation
    staleTime: 0, // Always fresh check
    gcTime: 0, // Don't cache invalid tokens
  });
}

/**
 * Hook to verify email address
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => verifyEmail(data),
    onError: (error) => {
      console.error('[Auth] Email verification failed:', error);
    },
  });
}

/**
 * Hook to validate email verification token
 */
export function useValidateVerificationToken(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.auth.verificationToken(token),
    queryFn: () => validateVerificationToken(token),
    enabled: enabled && !!token,
    retry: false, // Don't retry token validation
    staleTime: 0, // Always fresh check
    gcTime: 0, // Don't cache invalid tokens
  });
}

/**
 * Hook to resend email verification
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => resendVerification(data),
    onError: (error) => {
      console.error('[Auth] Resend verification failed:', error);
    },
  });
}
