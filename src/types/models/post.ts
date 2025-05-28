export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  status: string | 'draft' | 'published' | 'scheduled';
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    }
  }>;
  viewCount: number;
  likeCount: number;
  commentCount: number;

  // SEO fields
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoCanonicalUrl?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
  scheduledPublishAt?: Date | null;
}
