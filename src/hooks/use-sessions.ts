import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

export interface SessionInfo {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt?: Date;
  lastAccessed?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  isCurrent?: boolean;
}

export interface SessionsResponse {
  sessions: SessionInfo[];
  sessionCount: number;
  currentSessionToken?: string;
}

export interface SecuritySettings {
  sessionTimeout: number;
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

// API functions
async function fetchUserSessions(): Promise<SessionsResponse> {
  const response = await fetch('/api/user/sessions');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sessions');
  }
  
  return response.json();
}

async function revokeSession(sessionId: string): Promise<void> {
  const response = await fetch('/api/user/sessions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke session');
  }
}

async function revokeAllOtherSessions(): Promise<{ revokedCount: number }> {
  const response = await fetch('/api/user/sessions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      revokeAllOthers: true,
      confirm: true 
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke sessions');
  }
  
  return response.json();
}

async function fetchSecuritySettings(): Promise<SecuritySettings> {
  const response = await fetch('/api/user/security');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch security settings');
  }
  
  return response.json();
}

async function updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
  const response = await fetch('/api/user/security', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update security settings');
  }
}

// Hooks
export function useUserSessions() {
  return useQuery({
    queryKey: queryKeys.users.sessions(),
    queryFn: fetchUserSessions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.security() });
      toast.success('Session revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}

export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.security() });
      toast.success(`Successfully revoked ${data.revokedCount} session(s)`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke sessions');
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: queryKeys.users.security(),
    queryFn: fetchSecuritySettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.security() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      toast.success('Security settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update security settings');
    },
  });
}
