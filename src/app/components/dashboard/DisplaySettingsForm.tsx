"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export function DisplaySettingsForm() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState({
    theme: "system",
    compactView: false,
    fontSize: "100",
  });

  // Initialize client-side state and load localStorage settings
  useEffect(() => {
    setIsClient(true);

    if (theme) {
      setSettings((prev) => ({ ...prev, theme }));
    }

    // Only access localStorage on the client side to prevent hydration errors
    if (typeof window !== 'undefined') {
      const storedCompactView = localStorage.getItem("compactView");
      const storedFontSize = localStorage.getItem("fontSize");

      if (storedCompactView) {
        setSettings((prev) => ({ ...prev, compactView: storedCompactView === "true" }));
      }

      if (storedFontSize) {
        setSettings((prev) => ({ ...prev, fontSize: storedFontSize }));
      }
    }
  }, [theme]);

  const handleThemeChange = (value: string) => {
    setSettings((prev) => ({ ...prev, theme: value }));
  };

  const handleToggleCompactView = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, compactView: checked }));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, fontSize: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Apply theme change
      setTheme(settings.theme);

      // Only access localStorage and DOM on the client side
      if (typeof window !== 'undefined') {
        // Save other settings to localStorage
        localStorage.setItem("compactView", settings.compactView.toString());
        localStorage.setItem("fontSize", settings.fontSize);

        // Apply font size to document root
        document.documentElement.style.setProperty("--font-size-adjustment", `${parseInt(settings.fontSize) / 100}`);

        // Apply compact view class if enabled
        if (settings.compactView) {
          document.documentElement.classList.add("compact-view");
        } else {
          document.documentElement.classList.remove("compact-view");
        }
      }

      toast.success("Display settings updated successfully");
      router.refresh(); // Refresh the page to apply changes
    } catch (error) {
      toast.error("Failed to update display settings");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Customize how Journly looks and feels for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Customize how Journly looks and feels for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme or use your system settings.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-view">Compact View</Label>
              <Switch
                id="compact-view"
                checked={settings.compactView}
                onCheckedChange={handleToggleCompactView}
              />
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
                value={settings.fontSize}
                onChange={handleFontSizeChange}
              />
              <span className="text-lg">A</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust the font size for better readability.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Display Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
