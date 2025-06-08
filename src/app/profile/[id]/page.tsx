'use client';

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Mail, Edit, ArrowRight } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import { Skeleton } from "@/app/components/ui/skeleton";
import PostCard from "@/app/components/PostCard";
import { FollowButton } from "@/app/components/FollowButton";
import { UserActivityFeed } from "@/app/components/UserActivityFeed";
import { getInitials } from "@/lib/utils";
import { useUser, useUserPosts } from "@/hooks/use-users";


export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();

  // Use React.use() to avoid hook order issues
  const { id } = React.use(params);
  const currentUserId = session?.user?.id;

  const { data: user, isLoading: userLoading, error: userError } = useUser(id, !!id);
  const { data: postsData, isLoading: postsLoading, error: postsError } = useUserPosts(
    id,
    { limit: 9 },
    !!id
  );

  const isLoading = userLoading || postsLoading;
  const error = userError || postsError;
  const posts = postsData?.posts || [];
  const isCurrentUser = currentUserId === user?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <Skeleton className="h-8 w-48 mb-2 md:mb-0" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-16" />
                    <Skeleton className="h-12 w-16" />
                    <Skeleton className="h-12 w-16" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
              <p className="text-muted-foreground">The user you&apos;re looking for doesn&apos;t exist or failed to load.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-shrink-0 flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              {isCurrentUser ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <FollowButton
                  userId={user.id}
                  isFollowing={false} // We'll need to implement a hook to check this
                  variant="outline"
                  size="sm"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h1 className="text-3xl font-bold mb-2 md:mb-0">{user.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-semibold">{posts.length}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <Link href={`/profile/${user.id}/followers`} className="text-center hover:opacity-80">
                    <p className="text-xl font-semibold">0</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </Link>
                  <Separator orientation="vertical" className="h-10" />
                  <Link href={`/profile/${user.id}/following`} className="text-center hover:opacity-80">
                    <p className="text-xl font-semibold">0</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {user.bio && (
                  <p className="text-muted-foreground">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">

                  {user.email && isCurrentUser && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <Tabs defaultValue="posts" className="mt-8">
            <TabsList className="mb-8">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-medium mb-2">No posts yet</h2>
                  <p className="text-muted-foreground mb-6">
                    {isCurrentUser
                      ? "You have not published any posts yet."
                      : `${user.name} has not published any posts yet.`}
                  </p>
                  {isCurrentUser && (
                    <Button asChild>
                      <Link href="/dashboard/posts/new">Create Your First Post</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        createdAt: new Date(post.createdAt),
                        publishedAt: new Date(post.createdAt), // Use createdAt as fallback
                        readingTime: 5, // Default reading time
                        viewCount: 0,
                        likeCount: 0,
                        commentCount: 0,
                        author: {
                          id: user.id,
                          name: user.name,
                          image: user.image,
                          bio: user.bio,
                        },
                        categories: [],
                      }}
                    />
                  ))}
                </div>
              )}
              {posts.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" asChild>
                    <Link href={`/profile/${user.id}/posts`}>
                      View All Posts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
              <div className="max-w-3xl mx-auto">
                <UserActivityFeed userId={user.id} userName={user.name} />
              </div>
            </TabsContent>
            <TabsContent value="about">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">About {user.name}</h2>
                  {user.bio ? (
                    <p className="text-muted-foreground">{user.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio provided.</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Member Since</h2>
                  <p className="text-muted-foreground">{format(new Date(user.createdAt), "MMMM yyyy")}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
