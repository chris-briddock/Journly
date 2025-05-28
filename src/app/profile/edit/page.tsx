'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import ProfileForm from "@/app/components/ProfileForm";
import { useUser } from "@/hooks/use-users";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const { data: user, isLoading, error } = useUser(userId || '', !!userId);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (!isLoading && !user && session) {
      router.push("/dashboard");
    }
  }, [isLoading, user, session, router]);

  if (!session) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href={`/profile/${userId}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Profile
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information. Your email address cannot be changed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
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
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href={`/profile/${userId}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Profile
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500">Failed to load profile data.</p>
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
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href={`/profile/${userId}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information. Your email address cannot be changed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialData={{
                ...user
              }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
