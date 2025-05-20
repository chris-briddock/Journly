export interface Category {
  id: string;
  name: string;
  postCount: number;
  description: string | null;
  isDefault: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}