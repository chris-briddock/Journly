import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Notification } from "@/types/models/notification";
import { cookies } from "next/headers";


import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { MarkAllReadButton } from "../components/MarkAllReadButton";
import { NotificationItem } from "../components/NotificationItem";

export const metadata: Metadata = {
  title: "Notifications - Journly",
  description: "View your notifications",
};

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    tab?: string;
  }>;
}

async function getNotificationsFromApi(unreadOnly = false, page = 1, limit = 20) {
  // Use absolute URL with the correct origin for server components
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : '';

  const url = new URL('/api/notifications', baseUrl);

  // Add query parameters
  url.searchParams.append('unread', unreadOnly.toString());
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(url, {
    credentials: 'include',
    headers: {      
      'Content-Type': 'application/json',
      'cookie': cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }

  return response.json();
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const session = await auth();

  // Redirect if not logged in
  if (!session || !session.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "20");
  const tab = params.tab || "all";

  const { notifications, pagination } = await getNotificationsFromApi(
    tab === "unread",
    page,
    limit
  );

  return (
    <>
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications
          </p>
        </div>
        <MarkAllReadButton />
      </div>

      <Tabs defaultValue={tab} className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <a href="/notifications?tab=all">All</a>
            </TabsTrigger>
            <TabsTrigger value="unread" asChild>
              <a href="/notifications?tab=unread">Unread</a>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: Notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          asChild
                        >
                          <a href={`/notifications?tab=${tab}&page=${pageNum}`}>
                            {pageNum}
                          </a>
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No unread notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: Notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          asChild
                        >
                          <a href={`/notifications?tab=${tab}&page=${pageNum}`}>
                            {pageNum}
                          </a>
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
    </>
  );
}
