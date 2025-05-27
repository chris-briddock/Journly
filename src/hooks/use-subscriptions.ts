import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

export interface Subscription {
  id: string;
  status: string;
  tier: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface ArticleCount {
  articlesReadThisMonth: number;
  monthlyArticleLimit: number;
}

/**
 * Fetch current subscription
 */
export function fetchSubscription(): Promise<Subscription> {
  return apiGet<{ subscription: Subscription }>('/api/subscriptions').then(data => data.subscription);
}

/**
 * Fetch article count
 */
export function fetchArticleCount(): Promise<ArticleCount> {
  return apiGet<ArticleCount>('/api/users/article-count');
}

/**
 * Cancel subscription
 */
export function cancelSubscription(): Promise<Subscription> {
  return apiDelete<{ subscription: Subscription }>('/api/subscriptions').then(data => data.subscription);
}

/**
 * Create checkout session
 */
export function createCheckoutSession(data: {
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/subscriptions/checkout', data);
}

/**
 * Create billing portal session
 */
export function createBillingPortalSession(returnUrl: string): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/subscriptions/billing-portal', { returnUrl });
}

/**
 * Update subscription status
 */
export function updateSubscriptionStatus(data: {
  userId: string;
  tier: string;
  monthlyArticleLimit: number;
}): Promise<void> {
  return apiPost<void>('/api/subscriptions/update-status', data);
}

/**
 * Hook to fetch current subscription
 */
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscriptions.current(),
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch article count
 */
export function useArticleCount() {
  return useQuery({
    queryKey: queryKeys.subscriptions.articleCount(),
    queryFn: fetchArticleCount,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription');
      console.error('Cancel subscription error:', error);
    },
  });
}

/**
 * Hook to create checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to the checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid checkout URL');
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      toast.error(`Failed to start subscription process: ${errorMessage}`);
    },
  });
}

/**
 * Hook to create billing portal session
 */
export function useCreateBillingPortalSession() {
  return useMutation({
    mutationFn: createBillingPortalSession,
    onSuccess: (data) => {
      // Redirect to billing portal
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error('Failed to open billing portal');
      console.error('Billing portal error:', error);
    },
  });
}

/**
 * Hook to update subscription status
 */
export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubscriptionStatus,
    onSuccess: () => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      console.log('Subscription updated successfully');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
    },
  });
}
