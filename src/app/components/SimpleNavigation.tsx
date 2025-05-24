"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { NotificationDropdown } from "./NotificationDropdown";
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
import { getInitials } from "@/lib/utils";

export default function SimpleNavigation() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold font-serif">
              Journly
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/posts">Posts</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/categories">Categories</Link>
            </Button>
            {session && (
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {/* Subscription Button - Always visible */}
            <Button
              asChild
              variant="outline"
              className="bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary font-medium"
            >
              <Link href="/subscription">Become a Member</Link>
            </Button>

            {session ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                        <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {session.user?.name || "User"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user?.id}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/posts/new">Write Post</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/subscription">Manage Subscription</Link>
                    </DropdownMenuItem>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <span className="sr-only">Menu</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/">Home</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/posts">Posts</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/categories">Categories</Link>
                  </Button>

                  {/* Subscription Button - Always visible */}
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary font-medium"
                  >
                    <Link href="/subscription">Become a Member</Link>
                  </Button>

                  {session && (
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}
                  {!session && (
                    <>
                      <Button variant="ghost" onClick={() => signIn()} className="justify-start">
                        Sign In
                      </Button>
                      <Button asChild variant="default" className="justify-start">
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
