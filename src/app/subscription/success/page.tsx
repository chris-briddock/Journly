import type { Metadata } from "next/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { SubscriptionTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Subscription Successful - Journly",
  description: "Thank you for subscribing to Journly.",
};

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // Await both searchParams and auth in parallel for better performance
  const [params, session] = await Promise.all([
    searchParams,
    auth()
  ]);

  // If not logged in, redirect to home
  if (!session?.user) {
    redirect("/");
  }
  try {
    // Call the API to update the subscription status
    // Use absolute URL with the correct origin for server components
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : '';

    const response = await fetch(`${baseUrl}/api/subscriptions/update-status`, {
      method: 'POST',
      headers: {
        'Crendetials': 'include',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: session.user.id,
        tier: SubscriptionTier.MEMBER,
        monthlyArticleLimit: 999999
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to update subscription status:', await response.text());
    }
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }

  const returnUrl = params.from || "/posts";

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
            <Link href="/dashboard/settings">Manage Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
