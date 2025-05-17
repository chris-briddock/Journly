import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { UserSettingsForm } from "@/app/components/dashboard/UserSettingsForm";
import { NotificationSettingsForm } from "@/app/components/dashboard/NotificationSettingsForm";
import { PasswordUpdateForm } from "@/app/components/dashboard/PasswordUpdateForm";
import { DisplaySettingsForm } from "@/app/components/dashboard/DisplaySettingsForm";

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
    cache: 'no-store',
    next: { revalidate: 0 }
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
          <DisplaySettingsForm />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
