import { UserActivity } from "./userActivity";

export interface UserActivityResponse {
  items: UserActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}