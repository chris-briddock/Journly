"use client";

import React from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { MarkAllReadButton } from "../components/MarkAllReadButton";
import { NotificationItem } from "../components/NotificationItem";
import { useNotifications, type Notification } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Parse search params
  const page = parseInt(searchParams.get('page') || "1");
  const limit = parseInt(searchParams.get('limit') || "20");
  const tab = searchParams.get('tab') || "all";

  // Use TanStack Query to fetch notifications
  const { data: notificationData, isLoading, error } = useNotifications({
    page,
    limit,
    unreadOnly: tab === "unread",
  });

  // Loading state
  if (status === "loading" || isLoading) {
    return (
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
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Authentication check
  if (!session || !session.user) {
    redirect("/login");
  }

  // Error state
  if (error) {
    return (
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
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-500">Failed to load notifications. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const notifications = notificationData?.notifications || [];
  const pagination = notificationData?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 };

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
                      notification={{
                        ...notification,
                        createdAt: new Date(notification.createdAt),
                      }}
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
                      notification={{
                        ...notification,
                        createdAt: new Date(notification.createdAt),
                      }}
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
