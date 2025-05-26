'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { CreditCard, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { formatPrice } from '@/lib/stripe';
import { getApiUrl } from '@/lib/getApiUrl';

interface Subscription {
  id: string;
  tier: 'FREE' | 'MEMBER';
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionSettingsPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [articlesRead, setArticlesRead] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [manageBillingLoading, setManageBillingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = getApiUrl('/api/subscriptions');

        // During build time, skip API call
        if (!url) {
          console.log('[Build] Skipping subscription API call during static generation');
          setLoading(false);
          return;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data.subscription);

        // Fetch article count
        const articleUrl = getApiUrl('/api/users/article-count');

        if (articleUrl) {
          const articleResponse = await fetch(articleUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (articleResponse.ok) {
            const articleData = await articleResponse.json();
            setArticlesRead(articleData.articlesReadThisMonth || 0);
            setMonthlyLimit(articleData.monthlyArticleLimit || 5);
          }
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return;
    }

    try {
      setCancelLoading(true);

      const url = getApiUrl('/api/subscriptions');

      // During build time, skip API call
      if (!url) {
        console.log('[Build] Skipping cancel subscription API call during static generation');
        setCancelLoading(false);
        return;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);

      toast.success('Subscription cancelled successfully');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error('Failed to cancel subscription. Please try again later.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setManageBillingLoading(true);

      const apiUrl = getApiUrl('/api/subscriptions/billing-portal');

      // During build time, skip API call
      if (!apiUrl) {
        console.log('[Build] Skipping billing portal API call during static generation');
        setManageBillingLoading(false);
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Invalid billing portal URL');
      }
    } catch (err) {
      console.error('Error creating billing portal session:', err);
      toast.error('Failed to open billing portal. Please try again later.');
      setManageBillingLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'PAST_DUE':
        return <Badge variant="warning">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Subscription Settings"
        text="Manage your subscription and billing information."
      />

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Subscription Found</CardTitle>
            <CardDescription>
              You don&apos;t have an active subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Subscribe to get unlimited access to all premium content and features.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/subscription">View Subscription Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>
                    {subscription.tier === 'MEMBER' ? 'Premium Membership' : 'Free Plan'}
                  </CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscription.tier === 'MEMBER' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">{formatPrice(499)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing Period</span>
                      <span className="font-medium">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Subscription Cancelled</AlertTitle>
                        <AlertDescription>
                          Your subscription has been cancelled but will remain active until {formatDate(subscription.currentPeriodEnd)}.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
                {subscription.tier === 'FREE' && (
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-md">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Post Limit</p>
                        <p className="text-sm text-muted-foreground">
                          You&apos;ve read <span className="font-semibold">{articlesRead}</span> of your <span className="font-semibold">{monthlyLimit}</span> free posts this month
                        </p>
                      </div>
                    </div>
                    <p className="mb-4">
                      You&apos;re currently on the free plan. Upgrade to get unlimited access to all content and features.
                    </p>
                    <Button asChild>
                      <Link href="/subscription">Upgrade to Premium</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            {subscription.tier === 'MEMBER' && subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
                {subscription.stripeCustomerId && (
                  <Button
                    onClick={handleManageBilling}
                    disabled={manageBillingLoading}
                  >
                    {manageBillingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
