export interface Notification {
  id: string;
  type: string;
  read: boolean;
  message: string;
  link: string | null;
  createdAt: Date;
  actionUser: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  post: {
    id: string;
    title: string;
  } | null;
  comment: {
    id: string;
    content: string;
    postId: string;
  } | null;
}