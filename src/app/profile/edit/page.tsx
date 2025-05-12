import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getUser } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import Navigation from "@/app/components/Navigation";
import ProfileForm from "@/app/components/ProfileForm";

async function getUserProfile(userId: string) {
  return await getUser(userId);
}

export default async function EditProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id as string;
  const user = await getUserProfile(userId);

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
              <ProfileForm initialData={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
