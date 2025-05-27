"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUpdateUserProfile } from "@/hooks/use-users";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  location?: string | null;
}

interface UserSettingsFormProps {
  user: User;
}

export function UserSettingsForm({ user }: UserSettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    bio: user.bio || "",
    location: user.location || "",
  });

  // Use TanStack Query mutation
  const updateProfileMutation = useUpdateUserProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use TanStack Query mutation
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        router.refresh();
      },
      onError: () => {
        // Error toast is already handled in the hook
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Update your account information and profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.image || undefined} alt={formData.name || "User"} />
              <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium">{formData.name || "User"}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/your-image.jpg"
            />
            <p className="text-sm text-muted-foreground">
              Enter a URL for your profile image. For best results, use a square image.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
