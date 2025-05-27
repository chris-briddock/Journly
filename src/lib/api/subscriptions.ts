import { apiPost } from '@/lib/api-client';

export interface CreateCheckoutSessionData extends Record<string, unknown> {
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

/**
 * Create a Stripe checkout session
 */
export function createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
  return apiPost<CheckoutSessionResponse>('/api/subscriptions/checkout', data);
}

/**
 * Create billing portal session
 */
export function createBillingPortalSession(): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/subscriptions/billing-portal');
}
