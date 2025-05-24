# Subscription System Setup

This document provides instructions for setting up and maintaining the subscription system in Journly.

## Overview

Journly offers two subscription tiers:

1. **FREE Tier**:
   - Limited access to content (5 per month)
   - Core reading experience
   - Ad-supported experience

2. **MEMBER Tier**:
   - Unlimited access to all content
   - Ad-free experience
   - Full engagement features
   - Priority support
   - Early access to new features

## Environment Variables

Ensure the following environment variables are set:

```env
# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
STRIPE_MEMBER_PLAN_ID="your-stripe-price-id"

## Article Count Reset

### Client-Side Polling (Current Implementation)

Since we're using the free tier of Vercel which doesn't support cron jobs, we've implemented a client-side polling mechanism to reset article counts at the beginning of each month.

The `ArticleResetPoller` component checks if a user's article count needs to be reset when they visit the site. If the last reset date is before the start of the current month, it automatically resets the count.

This component is included in the dashboard layout and runs for authenticated users:

```tsx
// src/app/components/dashboard/ArticleResetPoller.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';

export function ArticleResetPoller() {
  const { data: session } = useSession();

  useEffect(() => {
    // Check if article counts need to be reset
    const checkArticleReset = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/users/article-reset-check');
        const data = await response.json();

        const startOfCurrentMonth = startOfMonth(new Date());
        const lastResetDate = data.lastArticleResetDate ? new Date(data.lastArticleResetDate) : null;

        if (!lastResetDate || isAfter(startOfCurrentMonth, lastResetDate)) {
          await fetch('/api/users/reset-article-count', { method: 'POST' });
        }
      } catch (error) {
        console.error('Error checking article reset status:', error);
      }
    };

    checkArticleReset();
    const interval = setInterval(checkArticleReset, 24 * 60 * 60 * 1000); // Check once per day

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
```

### Alternative: External Cron Service

If you upgrade to a paid Vercel plan or want to use an external service, you can set up a cron job to make the following HTTP request:

```bash
curl -X GET https://your-domain.com/api/cron/reset-article-counts \
  -H "Authorization: Bearer your-cron-api-key"
```

Schedule this to run at midnight on the first day of each month.

## Scheduled Post Publishing

### Client-Side Polling (Current Implementation)

For scheduled post publishing, we also use a client-side polling mechanism. The `ScheduledPostsPoller` component checks for scheduled posts that need to be published when users visit the site.

This component is included in the dashboard layout and runs for authenticated users:

```tsx
// src/app/components/dashboard/ScheduledPostsPoller.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ScheduledPostsPoller() {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);

  const checkScheduledPosts = async () => {
    if (isPolling) return;

    try {
      setIsPolling(true);
      await fetch('/api/cron/publish-scheduled', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch (error) {
      console.error('Error checking scheduled posts:', error);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    checkScheduledPosts();
    const interval = setInterval(checkScheduledPosts, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return null;
}
```

### Alternative: Vercel Cron Jobs (Paid Plans)

If you upgrade to a paid Vercel plan, you can set up a cron job to run every hour:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Monitoring Subscription Status

To monitor subscription status and ensure users have the correct access levels:

1. Check the Stripe dashboard for subscription status
2. Use the admin dashboard to view user subscription details
3. Monitor the webhook logs for subscription events

## Troubleshooting

### Common Issues

1. **Users can't access premium content despite having an active subscription**:
   - Check if the user's `monthlyArticleLimit` is set correctly (should be 999999 for MEMBER tier)
   - Verify the subscription status in the database
   - Check for webhook processing errors
model User {
  id                      String                       @id @default(cuid())
  name                    String?
  email                   String                       @unique
  emailVerified           DateTime?
  password                String?
  image                   String?
  bio                     String?
  location                String?
  followerCount           Int                          @default(0)
  followingCount          Int                          @default(0)
  postCount               Int                          @default(0)
  monthlyArticleLimit     Int                          @default(5)
  articlesReadThisMonth   Int                          @default(0)
  lastArticleResetDate    DateTime?
  createdAt               DateTime                     @default(now())
  updatedAt               DateTime                     @updatedAt
2. **Free users can access more than their monthly limit**:
   - Ensure the monthly reset cron job is running correctly
   - Check if the `articlesReadThisMonth` counter is being incremented properly
   - Verify the `lastArticleResetDate` is being updated

3. **Subscription payments failing**:
   - Check Stripe logs for payment failure details
   - Ensure webhook endpoints are properly configured
   - Verify the customer's payment method is valid

## Manual Reset

To manually reset all users' article counts, you can call the reset API endpoint:

```bash
curl -X GET https://your-domain.com/api/cron/reset-article-counts \
  -H "Authorization: Bearer your-cron-api-key"
```

Or run the following SQL query directly on the database:

```sql
UPDATE "User"
SET "articlesReadThisMonth" = 0, "lastArticleResetDate" = NOW()
WHERE id IN (
  SELECT u.id FROM "User" u
  LEFT JOIN "Subscription" s ON u.id = s.userId
  WHERE s.tier = 'FREE' OR s.id IS NULL
);
```
