export interface UserFilters extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'scheduled' | 'all';
  dashboard?: boolean;
  q?: string;
}