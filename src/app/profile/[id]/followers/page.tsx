import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next/types";
import { ChevronLeft } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { FollowButton } from "@/app/components/FollowButton";
import SimpleNavigation from "@/app/components/SimpleNavigation";
import { getInitials } from "@/lib/utils";

interface FollowersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });

  return user;
}

async function getFollowers(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            followerCount: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.count({
      where: { followingId: userId },
    }),
  ]);

  const formattedFollowers = followers.map((follow) => follow.follower);

  return {
    followers: formattedFollowers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function isFollowing(followerId: string, followingId: string) {
  if (!followerId || !followingId) return false;

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  return !!follow;
}

export async function generateMetadata({ params }: FollowersPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return {
      title: "User Not Found - Journly",
    };
  }

  return {
    title: `${user.name}'s Followers - Journly`,
    description: `People who follow ${user.name} on Journly`,
  };
}

export default async function FollowersPage({ params, searchParams }: FollowersPageProps) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const page = parseInt(searchParamsData.page || "1");
  const limit = parseInt(searchParamsData.limit || "20");

  const session = await auth();
  const currentUserId = session?.user?.id;

  const [user, { followers, pagination }] = await Promise.all([
    getUser(id),
    getFollowers(id, page, limit),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigation />
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
              <CardTitle>Followers</CardTitle>
              <CardDescription>
                People who follow {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {user.name} doesn&apos;t have any followers yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followers.map(async (follower) => {
                    const isCurrentUserFollowing = currentUserId
                      ? await isFollowing(currentUserId, follower.id)
                      : false;

                    return (
                      <div key={follower.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={follower.image || undefined} alt={follower.name || "User"} />
                            <AvatarFallback>{getInitials(follower.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/profile/${follower.id}`} className="font-medium hover:underline">
                              {follower.name}
                            </Link>
                            {follower.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {follower.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        {currentUserId && currentUserId !== follower.id && (
                          <FollowButton
                            userId={follower.id}
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
                        <Link href={`/profile/${id}/followers?page=${pageNumber}`}>
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
