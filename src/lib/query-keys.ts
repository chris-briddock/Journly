/**
 * Query Keys Factory
 * Centralized query key management following TanStack Query best practices
 */

type QueryFilters = Record<string, string | number | boolean | undefined>;

export const queryKeys = {
  // Posts
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    recent: (limit?: number) => [...queryKeys.posts.all, 'recent', limit] as const,
    related: (postId: string, categoryIds: string[]) =>
      [...queryKeys.posts.all, 'related', postId, categoryIds] as const,
    scheduled: (filters: QueryFilters) =>
      [...queryKeys.posts.all, 'scheduled', filters] as const,
    scheduledCheck: () => [...queryKeys.posts.all, 'scheduledCheck'] as const,
    preview: (id: string) => [...queryKeys.posts.all, 'preview', id] as const,
    metadata: (id: string) => [...queryKeys.posts.all, 'metadata', id] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    popular: (limit?: number) => [...queryKeys.categories.all, 'popular', limit] as const,
    trending: (limit?: number) => [...queryKeys.categories.all, 'trending', limit] as const,
    admin: (filters: QueryFilters) => [...queryKeys.categories.all, 'admin', filters] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    posts: (userId: string, filters: QueryFilters) =>
      [...queryKeys.users.detail(userId), 'posts', filters] as const,
    followers: (userId: string, filters: QueryFilters) =>
      [...queryKeys.users.detail(userId), 'followers', filters] as const,
    following: (userId: string, filters: QueryFilters) =>
      [...queryKeys.users.detail(userId), 'following', filters] as const,
    activity: (userId: string, filters: QueryFilters) =>
      [...queryKeys.users.detail(userId), 'activity', filters] as const,
    isFollowing: (userId: string) =>
      [...queryKeys.users.detail(userId), 'isFollowing'] as const,
    search: (query: string, limit: number) =>
      [...queryKeys.users.all, 'search', query, limit] as const,
    articleResetStatus: () =>
      [...queryKeys.users.all, 'articleResetStatus'] as const,
    notificationPreferences: () =>
      [...queryKeys.users.all, 'notificationPreferences'] as const,
  },

  // Comments
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (postId: string) => [...queryKeys.comments.lists(), postId] as const,
    details: () => [...queryKeys.comments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.comments.details(), id] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentPosts: (limit?: number) => [...queryKeys.dashboard.all, 'recentPosts', limit] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.notifications.lists(), filters] as const,
  },

  // Subscriptions
  subscriptions: {
    all: ['subscriptions'] as const,
    current: () => [...queryKeys.subscriptions.all, 'current'] as const,
    articleCount: () => [...queryKeys.subscriptions.all, 'articleCount'] as const,
  },

  // Bookmarks
  bookmarks: {
    all: ['bookmarks'] as const,
    lists: () => [...queryKeys.bookmarks.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.bookmarks.lists(), filters] as const,
    status: (postId: string) => [...queryKeys.bookmarks.all, 'status', postId] as const,
  },

  // Likes
  likes: {
    all: ['likes'] as const,
    status: (postId: string) => [...queryKeys.likes.all, 'status', postId] as const,
  },

  // Reading History
  readingHistory: {
    all: ['readingHistory'] as const,
    lists: () => [...queryKeys.readingHistory.all, 'list'] as const,
    list: (filters: QueryFilters) => [...queryKeys.readingHistory.lists(), filters] as const,
  },

  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    list: (limit?: number) => [...queryKeys.recommendations.all, 'list', limit] as const,
  },

  // SEO
  seo: {
    all: ['seo'] as const,
    metadata: (postId: string) => [...queryKeys.seo.all, 'metadata', postId] as const,
    analysis: (metadata: Record<string, unknown>) => [...queryKeys.seo.all, 'analysis', metadata] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    posts: (filters: QueryFilters) => [...queryKeys.analytics.all, 'posts', filters] as const,
    engagement: () => [...queryKeys.analytics.all, 'engagement'] as const,
  },

  // Authentication
  auth: {
    all: ['auth'] as const,
    resetToken: (token: string) => [...queryKeys.auth.all, 'resetToken', token] as const,
    verificationToken: (token: string) => [...queryKeys.auth.all, 'verificationToken', token] as const,
    twoFactorSetup: () => [...queryKeys.auth.all, 'twoFactorSetup'] as const,
  },
} as const;
