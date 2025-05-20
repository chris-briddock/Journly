'use client'

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Tag,
  BarChart2,
  Settings,
  Home,
  BookOpen,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ScheduledPostsPoller } from "@/app/components/dashboard/ScheduledPostsPoller";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Posts",
      href: "/dashboard/posts",
      icon: FileText,
    },
    {
      title: "Scheduled Posts",
      href: "/dashboard/scheduled",
      icon: Clock,
    },
    {
      title: "Categories",
      href: "/dashboard/categories",
      icon: Tag,
    },
    {
      title: "Reading History",
      href: "/dashboard/reading-history",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "justify-start",
            pathname === item.href && "bg-accent text-accent-foreground"
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
      <div className="flex min-h-screen flex-col">
        {/* Add the ScheduledPostsPoller component to automatically check for scheduled posts */}
        <ScheduledPostsPoller />

        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold font-serif">
                Journly
              </Link>
              <span className="text-muted-foreground">Dashboard</span>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Back to Site</Link>
              </Button>
            </nav>
          </div>
        </header>
        <div className="container mx-auto px-4 max-w-7xl flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="fixed top-20 z-30 hidden h-[calc(100vh-5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <div className="py-6 pr-6 pl-4">
              <DashboardNav />
            </div>
          </aside>

          <main className="flex w-full flex-col overflow-hidden py-6">
            {children}
          </main>
        </div>
      </div>
  );
}
