'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateCheckoutSession } from '@/hooks/use-subscriptions';

interface SubscriptionButtonProps {
  className?: string;
  returnUrl?: string;
}

export function SubscriptionButton({ className, returnUrl = '/posts' }: SubscriptionButtonProps) {
  // Use TanStack Query mutation
  const createCheckoutMutation = useCreateCheckoutSession();

  const handleSubscribe = async () => {
    // Use TanStack Query mutation
    createCheckoutMutation.mutate({
      successUrl: `${window.location.origin}/subscription/success?from=${returnUrl}`,
      cancelUrl: `${window.location.origin}/subscription?from=${returnUrl}`,
    });
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={createCheckoutMutation.isPending}
      className={cn(className)}
    >
      {createCheckoutMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Subscribe Now'
      )}
    </Button>
  );
}
