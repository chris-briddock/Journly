import { Prisma, User } from '@prisma/client';

// Define subscription tier enum
export enum SubscriptionTier {
  FREE = 'FREE',
  MEMBER = 'MEMBER'
}

// Define subscription status enum
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  TRIALING = 'TRIALING',
  UNPAID = 'UNPAID'
}

// Define Subscription model
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define ArticleAccess model
export interface ArticleAccess {
  id: string;
  userId: string;
  postId: string;
  accessedAt: Date;
}

// Define Payment model
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define custom types for User with subscription relation
export interface UserWithSubscription extends User {
  subscription: Subscription | null;
}

// Define custom types for Post with isPremium field
export interface PostWithPremium {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  status: string;
  featuredImage?: string | null;
  isPremium: boolean;
  authorId: string;
}

// Define custom types for User with article access fields
export interface UserWithArticleAccess {
  id: string;
  articlesReadThisMonth: number;
  monthlyArticleLimit: number;
  lastArticleResetDate?: Date | null;
}

// Define Stripe webhook event types
export interface StripeInvoice {
  id: string;
  subscription?: string;
  payment_intent?: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
}

// Define Prisma update types for type safety
export type UserUpdateInput = Prisma.UserUpdateInput;
