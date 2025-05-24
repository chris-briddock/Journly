'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionButtonProps {
  className?: string;
  returnUrl?: string;
}

export function SubscriptionButton({ className, returnUrl = '/posts' }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      // Create a checkout session
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/subscription/success?from=${returnUrl}`,
          cancelUrl: `${window.location.origin}/subscription?from=${returnUrl}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = data;

      // Redirect to the checkout page
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Invalid checkout URL');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to start subscription process: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
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
