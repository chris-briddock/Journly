'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { FollowButton } from "@/app/components/FollowButton";
import { getInitials } from "@/lib/utils";
import { useUser, useUserFollowing } from "@/hooks/use-users";

interface FollowingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default function FollowingPage({ params, searchParams }: FollowingPageProps) {
  const { data: session } = useSession();
  const [id, setId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Get the ID and search params from props
  useEffect(() => {
    Promise.all([params, searchParams]).then(([paramsData, searchParamsData]) => {
      setId(paramsData.id);
      setPage(parseInt(searchParamsData.page || "1"));
      setLimit(parseInt(searchParamsData.limit || "20"));
    });
  }, [params, searchParams]);

  const currentUserId = session?.user?.id;

  const { data: user, isLoading: userLoading, error: userError } = useUser(id, !!id);
  const { data: followingData, isLoading: followingLoading, error: followingError } = useUserFollowing(
    id,
    { page, limit },
    !!id
  );

  const isLoading = userLoading || followingLoading;
  const error = userError || followingError;
  const following = followingData?.following || [];
  const pagination = followingData?.pagination || { totalPages: 1, currentPage: 1, totalCount: 0 };

  if (isLoading) {
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
                  <Skeleton className="h-4 w-32" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
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
              <CardContent className="text-center py-8">
                <p className="text-red-500">User not found or failed to load.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
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
                  {following.map((followedUser) => (
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
                          isFollowing={false} // We'll need to implement a hook to check this
                          size="sm"
                        />
                      )}
                    </div>
                  ))}
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
