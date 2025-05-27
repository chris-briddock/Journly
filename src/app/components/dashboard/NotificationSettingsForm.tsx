"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Bell, Mail, Info } from "lucide-react";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/use-users";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { Badge } from "../../components/ui/badge";

export function NotificationSettingsForm() {
  const router = useRouter();

  // Use TanStack Query hooks
  const { data: notificationData, isLoading, error } = useNotificationPreferences();
  const updateNotificationsMutation = useUpdateNotificationPreferences();

  // Initialize settings from query data
  const [settings, setSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    newComments: true,
    newLikes: true,
    newFollowers: true,
    mentions: true,
    newsletter: false,
    marketingEmails: false,
    postUpdates: true,
    commentReplies: true,
    newPostsFromFollowing: true,
    mentionsInPosts: true,
    mentionsInComments: true,
  });

  // Check if browser notifications are supported
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Update settings when data is loaded
  useEffect(() => {
    if (notificationData) {
      setSettings(notificationData);
    }
  }, [notificationData]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching notification preferences:', error);
    }
  }, [error]);

  // Check if browser notifications are supported
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsSupported(true);
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'browserNotifications' && settings.browserNotifications === false) {
      // Request permission when enabling browser notifications
      if (notificationsSupported && notificationPermission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            setSettings((prev) => ({ ...prev, [key]: true }));
            // Show a test notification
            new Notification('Notification Test', {
              body: 'Notifications are now enabled for Journly',
              icon: '/favicon.ico'
            });
          } else {
            toast.error("Browser notification permission denied");
          }
        });
      } else {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
      }
    } else {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use TanStack Query mutation
    updateNotificationsMutation.mutate(settings, {
      onSuccess: () => {
        router.refresh(); // Refresh the page to show updated settings
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
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications.
          </CardDescription>
          {isLoading && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading your preferences...
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Delivery Methods</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  {!notificationsSupported && (
                    <Badge variant="outline" className="ml-2 text-xs">Not supported</Badge>
                  )}
                  {notificationPermission === 'denied' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge variant="destructive" className="ml-2 text-xs">Blocked</Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You&apos;ve blocked notifications in your browser settings.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <Switch
                  id="browser-notifications"
                  checked={settings.browserNotifications}
                  onCheckedChange={() => handleToggle("browserNotifications")}
                  disabled={!notificationsSupported || notificationPermission === 'denied'}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser when you&apos;re on the site.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Activity Notifications</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-comments">New Comments</Label>
                <Switch
                  id="new-comments"
                  checked={settings.newComments}
                  onCheckedChange={() => handleToggle("newComments")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when someone comments on my posts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="comment-replies">Comment Replies</Label>
                <Switch
                  id="comment-replies"
                  checked={settings.commentReplies}
                  onCheckedChange={() => handleToggle("commentReplies")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when someone replies to my comments.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-likes">New Likes</Label>
                <Switch
                  id="new-likes"
                  checked={settings.newLikes}
                  onCheckedChange={() => handleToggle("newLikes")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when someone likes my posts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-followers">New Followers</Label>
                <Switch
                  id="new-followers"
                  checked={settings.newFollowers}
                  onCheckedChange={() => handleToggle("newFollowers")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when someone follows me.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mentions">Mentions</Label>
                <Switch
                  id="mentions"
                  checked={settings.mentions}
                  onCheckedChange={() => handleToggle("mentions")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when someone mentions me in a comment.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-updates">Post Updates</Label>
                <Switch
                  id="post-updates"
                  checked={settings.postUpdates}
                  onCheckedChange={() => handleToggle("postUpdates")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when posts I follow are updated.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-posts-following">New Posts from Following</Label>
                <Switch
                  id="new-posts-following"
                  checked={settings.newPostsFromFollowing}
                  onCheckedChange={() => handleToggle("newPostsFromFollowing")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when users I follow publish new posts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mentions-in-posts">Mentions in Posts</Label>
                <Switch
                  id="mentions-in-posts"
                  checked={settings.mentionsInPosts}
                  onCheckedChange={() => handleToggle("mentionsInPosts")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when I am mentioned in a post.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mentions-in-comments">Mentions in Comments</Label>
                <Switch
                  id="mentions-in-comments"
                  checked={settings.mentionsInComments}
                  onCheckedChange={() => handleToggle("mentionsInComments")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Notify me when I am mentioned in a comment.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Marketing Emails</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px]">You can unsubscribe from marketing emails at any time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newsletter">Weekly Newsletter</Label>
                <Switch
                  id="newsletter"
                  checked={settings.newsletter}
                  onCheckedChange={() => handleToggle("newsletter")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive our weekly newsletter with the best content.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing-emails">Product Updates</Label>
                <Switch
                  id="marketing-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={() => handleToggle("marketingEmails")}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <Button type="submit" disabled={updateNotificationsMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {updateNotificationsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Notification Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
