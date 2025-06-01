import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import { TwoFactorService } from '@/lib/services/two-factor-service';

// Re-export types for backward compatibility
export type {
  TwoFactorSetupResponse as TwoFactorSetupData,
  TwoFactorVerifySetupRequest,
  TwoFactorVerifySetupResponse,
  TwoFactorDisableRequest,
  TwoFactorBackupCodesRequest,
  TwoFactorBackupCodesResponse,
  TwoFactorVerifyRequest,
} from '@/lib/services/two-factor-service';

// Hooks
export function useTwoFactorSetup() {
  return useQuery({
    queryKey: queryKeys.auth.twoFactorSetup(),
    queryFn: TwoFactorService.getSetupData,
    enabled: false, // Only fetch when explicitly called
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });
}

export function useVerifyTwoFactorSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TwoFactorService.verifySetup,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate all user queries to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      // Also invalidate any specific user detail queries
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'users' && query.queryKey[1] === 'detail'
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TwoFactorService.disable,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate all user queries to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      // Also invalidate any specific user detail queries
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'users' && query.queryKey[1] === 'detail'
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: TwoFactorService.regenerateBackupCodes,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyTwoFactor() {
  return useMutation({
    mutationFn: TwoFactorService.verifyToken,
    onError: (error: Error) => {
      console.error('[2FA Verify] Error:', error);
    },
  });
}
