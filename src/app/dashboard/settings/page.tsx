import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { UserSettingsForm } from "@/app/components/dashboard/UserSettingsForm";
import { NotificationSettingsForm } from "@/app/components/dashboard/NotificationSettingsForm";
import { PasswordUpdateForm } from "@/app/components/dashboard/PasswordUpdateForm";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  location: string | null;
}

export const metadata: Metadata = {
  title: "Settings - Journly",
  description: "Manage your account settings",
};

async function getUserById(userId: string): Promise<User> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const response = await fetch(`${baseUrl}/api/users/${userId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your account settings and preferences."
      />

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <UserSettingsForm user={user} />
          <PasswordUpdateForm />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how Journly looks and feels for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-mode">Dark Mode</Label>
                  <Switch id="theme-mode" defaultChecked={false} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for a more comfortable reading experience in low light.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch id="compact-view" defaultChecked={false} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Show more content with less spacing between items.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">A</span>
                  <Input
                    id="font-size"
                    type="range"
                    min="80"
                    max="120"
                    defaultValue="100"
                  />
                  <span className="text-lg">A</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adjust the font size for better readability.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Display Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
