import { User } from "./user";

export interface UsersResponse {
  users?: User[];
  followers?: User[];
  following?: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}