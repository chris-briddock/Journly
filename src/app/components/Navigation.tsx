"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu } from "lucide-react";

import { NotificationDropdown } from "./NotificationDropdown";

import { cn, getInitials } from "@/lib/utils";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userInitials = getInitials(session?.user?.name);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/posts", label: "Posts" },
    { href: "/categories", label: "Categories" },
  ];

  // Dynamic user nav items that depend on the session
  const getUserNavItems = () => {
    if (!session || !session.user) {
      return [
        { href: "/dashboard/posts/new", label: "Write Post" },
      ];
    }

    return [
      { href: `/profile/${session.user.id}`, label: "Profile" },
      { href: "/dashboard/posts/new", label: "Write Post" },
    ];
  };

  const userNavItems = getUserNavItems();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Journly
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}

            {session && (
              <Button
                asChild
                variant="ghost"
                className={cn(
                  pathname === "/dashboard" && "bg-accent text-accent-foreground"
                )}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {session ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {session.user?.name || "User"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNavItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => signIn()}>
                  Sign In
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-4">
                  <SheetTitle>Journly</SheetTitle>
                </SheetHeader>
                <div className="grid gap-2 py-4">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant="ghost"
                      className={cn(
                        "justify-start",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}

                  {session ? (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        className={cn(
                          "justify-start",
                          pathname === "/dashboard" && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                      {userNavItems.map((item) => (
                        <Button
                          key={item.href}
                          asChild
                          variant="ghost"
                          className={cn(
                            "justify-start",
                            pathname === item.href && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        className="justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          signIn();
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        asChild
                        className="justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
