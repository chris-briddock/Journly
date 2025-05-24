import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next/types";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { FollowButton } from "@/app/components/FollowButton";
import { getInitials } from "@/lib/utils";
import { getUser } from "@/lib/services/getUser";
import { getUserFollowing } from "@/lib/services/getUserFollowing";
import { getIsFollowing } from "@/lib/services/getIsFollowing";
import { Follower } from "@/types/models/follower";

interface FollowingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

// Use the imported service functions instead of direct Prisma calls

export async function generateMetadata({ params }: FollowingPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return {
      title: "User Not Found - Journly",
    };
  }

  return {
    title: `People ${user.name} Follows - Journly`,
    description: `People that ${user.name} follows on Journly`,
  };
}

export default async function FollowingPage({ params, searchParams }: FollowingPageProps) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const page = parseInt(searchParamsData.page || "1");
  const limit = parseInt(searchParamsData.limit || "20");

  const session = await auth();
  const currentUserId = session?.user?.id;

  const [user, followingData] = await Promise.all([
    getUser(id),
    getUserFollowing(id, { page, limit }),
  ]);

  const { following, pagination } = followingData;

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/profile/${id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Profile
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Following</CardTitle>
              <CardDescription>
                People {user.name} follows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {following.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {user.name} isn&apos;t following anyone yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {following.map(async (followedUser: Follower) => {
                    const isCurrentUserFollowing = currentUserId
                      ? await getIsFollowing(followedUser.id)
                      : false;

                    return (
                      <div key={followedUser.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={followedUser.image || undefined} alt={followedUser.name || "User"} />
                            <AvatarFallback>{getInitials(followedUser.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/profile/${followedUser.id}`} className="font-medium hover:underline">
                              {followedUser.name}
                            </Link>
                            {followedUser.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {followedUser.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        {currentUserId && currentUserId !== followedUser.id && (
                          <FollowButton
                            userId={followedUser.id}
                            isFollowing={isCurrentUserFollowing}
                            size="sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === page ? "default" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link href={`/profile/${id}/following?page=${pageNumber}`}>
                          {pageNumber}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
