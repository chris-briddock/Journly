import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Mail, MapPin, Edit, ArrowRight } from "lucide-react";

import { getUser as getUserApi, getUserPosts as getUserPostsApi, isFollowing as isFollowingApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import PostCard from "@/app/components/PostCard";
import { FollowButton } from "@/app/components/FollowButton";
import { UserActivityFeed } from "@/app/components/UserActivityFeed";
import SimpleNavigation from "@/app/components/SimpleNavigation";
import { getInitials } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    }
  }>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

async function getUser(id: string) {
  return await getUserApi(id);
}

async function isFollowing(followerId: string, followingId: string) {
  if (!followerId || !followingId) return false;

  return await isFollowingApi(followingId);
}

async function getUserPosts(userId: string): Promise<Post[]> {
  const response = await getUserPostsApi(userId, { limit: 9 });
  return response.posts || [];
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const [user, posts, following] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    currentUserId ? isFollowing(currentUserId, id) : false,
  ]);

  if (!user) {
    notFound();
  }

  const isCurrentUser = currentUserId === user.id;


  const formatDate = (date: Date) => {
    return format(new Date(date), "MMMM yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigation />
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
                  isFollowing={following}
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
                    <p className="text-xl font-semibold">{user.postCount}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <Link href={`/profile/${user.id}/followers`} className="text-center hover:opacity-80">
                    <p className="text-xl font-semibold">{user.followerCount}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </Link>
                  <Separator orientation="vertical" className="h-10" />
                  <Link href={`/profile/${user.id}/following`} className="text-center hover:opacity-80">
                    <p className="text-xl font-semibold">{user.followingCount}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {user.bio && (
                  <p className="text-muted-foreground">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.email && isCurrentUser && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
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
                    <PostCard key={post.id} post={post} />
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
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  {user.location ? (
                    <p className="text-muted-foreground">{user.location}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No location provided.</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Member Since</h2>
                  <p className="text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
