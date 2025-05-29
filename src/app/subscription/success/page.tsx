"use client";

import React from "react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/app/components/ui/button";
import { useUpdateSubscriptionStatus } from "@/hooks/use-subscriptions";

export default function SubscriptionSuccessPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Use TanStack Query mutation to update subscription status
  const updateSubscriptionMutation = useUpdateSubscriptionStatus();

  React.useEffect(() => {
    // Update subscription status when component mounts
    if (session?.user?.id) {
      updateSubscriptionMutation.mutate({
        userId: session.user.id,
        tier: 'MEMBER',
        monthlyArticleLimit: 999999
      });
    }
  }, [session?.user?.id, updateSubscriptionMutation]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold mb-4">Processing...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to home
  if (!session?.user) {
    redirect("/");
  }

  const returnUrl = searchParams.get('from') || "/posts";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Subscription Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for subscribing to Journly. You now have unlimited access to all premium content and features.
        </p>
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href={returnUrl}>Continue Reading</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/subscription">Manage Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
