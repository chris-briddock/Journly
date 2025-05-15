'use client'

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Heart, Eye } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cleanHtml } from "@/lib/cleanHtml";

interface Category {
  category: {
    id: string;
    name: string;
  };
};

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: Category[];
};

interface PostCardProps {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {post.featuredImage && (
        <div className="relative w-full h-48 overflow-hidden">
          <Link href={`/posts/${post.id}`}>
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />
          </Link>
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.categories.slice(0, 2).map(({ category }) => (
            <Link href={`/posts?categoryId=${category.id}`} key={category.id}>
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            </Link>
          ))}
          {post.categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{post.categories.length - 2} more
            </Badge>
          )}
        </div>
        <Link href={`/posts/${post.id}`} className="group">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:underline">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {cleanHtml(post.excerpt)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-auto">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.image || undefined} alt={post.author.name || "User"} />
              <AvatarFallback className="text-xs">{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{post.author.name}</span>
          </Link>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t flex justify-between text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs">
            <Heart className="h-3.5 w-3.5" />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.viewCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
