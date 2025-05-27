export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string
  createdAt: string;
  updatedAt: string;
}