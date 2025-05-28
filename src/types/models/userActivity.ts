export interface UserActivity {
  id: string;
  type: 'post' | 'comment' | 'like';
  createdAt: string;
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string | null;
  post?: {
    id: string;
    title: string;
    featuredImage?: string | null;
  };
}