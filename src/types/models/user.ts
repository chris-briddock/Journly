export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}