'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { CreditCard, Loader2, AlertCircle, BookOpen } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/app/components/dashboard/DashboardShell';
import { formatPrice } from '@/lib/stripe';
import { useSubscription, useArticleCount, useCancelSubscription, useCreateBillingPortalSession } from '@/hooks/use-subscriptions';

export default function SubscriptionSettingsPage() {
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription();
  const { data: articleData } = useArticleCount();

  const cancelSubscriptionMutation = useCancelSubscription();
  const createBillingPortalMutation = useCreateBillingPortalSession();

  const articlesRead = articleData?.articlesReadThisMonth || 0;
  const monthlyLimit = 5;
  const loading = subscriptionLoading;
  const cancelLoading = cancelSubscriptionMutation.isPending;
  const manageBillingLoading = createBillingPortalMutation.isPending;
  const error = subscriptionError ? 'Failed to load subscription information. Please try again later.' : null;

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return;
    }

    cancelSubscriptionMutation.mutate();
  };

  const handleManageBilling = async () => {
    createBillingPortalMutation.mutate(window.location.href);
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
                      <span className="text-muted-foreground">Next Billing Date</span>
                      <span className="font-medium">
                        {formatDate(subscription.currentPeriodEnd)}
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
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
