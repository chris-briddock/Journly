import type { Metadata } from "next/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { formatPrice, SUBSCRIPTION_PRICES } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/services/subscription-service";
import { SubscriptionButton } from "@/app/components/subscription/SubscriptionButton";

export const metadata: Metadata = {
  title: "Subscription Plans - Journly",
  description: "Choose a subscription plan to access premium content on Journly.",
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // Await both searchParams and auth in parallel for better performance
  const [params, session] = await Promise.all([
    searchParams,
    auth()
  ]);

  const userId = session?.user?.id;

  // If not logged in, redirect to login
  if (!userId) {
    const fromPath = params.from || "/subscription";
    redirect(`/login?from=${fromPath}`);
  }

  // Check if the user already has an active subscription
  const hasSubscription = await hasActiveSubscription(userId);

  // Features for each plan
  const freePlanFeatures = [
    { name: "Limited access to articles (5 premium articles per month)", included: true },
    { name: "Core reading experience", included: true },
    { name: "Limited engagement features", included: true },
    { name: "Ad-supported experience", included: true },
    { name: "Full article search", included: false },
    { name: "Unlimited premium content", included: false },
    { name: "Ad-free experience", included: false },
    { name: "Priority support", included: false },
  ];

  const memberPlanFeatures = [
    { name: "Unlimited access to all articles", included: true },
    { name: "Core reading experience", included: true },
    { name: "Full engagement features", included: true },
    { name: "Ad-free experience", included: true },
    { name: "Full article search", included: true },
    { name: "Unlimited premium content", included: true },
    { name: "Priority support", included: true },
    { name: "Early access to new features", included: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Subscription Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get unlimited access to all premium content and features with a Journly membership.
            </p>
          </div>

          {hasSubscription ? (
            <div className="text-center mb-12 p-6 bg-muted rounded-lg">
              <h2 className="text-2xl font-bold mb-2">You Already Have an Active Subscription</h2>
              <p className="mb-6">
                You&apos;re already enjoying all the benefits of a Journly membership.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/settings">Manage Subscription</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Basic access to Journly content</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground"> / month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {freePlanFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={params.from || "/posts"}>
                      Continue with Free Plan
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Member Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Member Plan</CardTitle>
                      <CardDescription>Full access to all Journly content</CardDescription>
                    </div>
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(SUBSCRIPTION_PRICES.MEMBER)}</span>
                    <span className="text-muted-foreground"> / month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {memberPlanFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <SubscriptionButton
                    className="w-full"
                    returnUrl={params.from || "/posts"}
                  />
                </CardFooter>
              </Card>
            </div>
          )}

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div>
                <h3 className="text-lg font-semibold mb-2">What&apos;s included in the membership?</h3>
                <p className="text-muted-foreground">
                  Members get unlimited access to all articles, an ad-free experience, full engagement features,
                  priority support, and early access to new features.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How many premium articles can I read with the free plan?</h3>
                <p className="text-muted-foreground">
                  Free users can read up to 5 premium articles per month. This counter resets at the beginning of each month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
