"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { UserSettingsForm } from "@/app/components/dashboard/UserSettingsForm";
import { NotificationSettingsForm } from "@/app/components/dashboard/NotificationSettingsForm";
import { PasswordUpdateForm } from "@/app/components/dashboard/PasswordUpdateForm";
import { DisplaySettingsForm } from "@/app/components/dashboard/DisplaySettingsForm";
import { useUser } from "@/hooks/use-users";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  // Use TanStack Query to fetch user data
  const { data: user, isLoading, error } = useUser(session?.user?.id || "", !!session?.user?.id);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Settings"
          text="Manage your account settings and preferences."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  // Authentication check
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Error state or no user
  if (error || !user) {
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
