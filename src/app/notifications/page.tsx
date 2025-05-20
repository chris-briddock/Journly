import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Notification } from "@/types/models/notification";



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

async function getNotifications(userId: string, unreadOnly = false, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Build the where clause
  const where: { userId: string; read?: boolean } = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actionUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            postId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const session = await auth();

  // Redirect if not logged in
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id as string;
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "20");
  const tab = params.tab || "all";

  const { notifications, pagination } = await getNotifications(
    userId,
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
