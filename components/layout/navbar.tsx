"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Cake,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import WarningModal from "@/components/warningModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const subscribeToNothing = () => () => {};

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const displayName =
    session?.user?.name?.trim() || session?.user?.email || "Your account";
  const email = session?.user?.email ?? "";
  const initial = displayName.charAt(0).toUpperCase() || "S";

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = () => {
    setSignOutOpen(false);
    void signOut({ callbackUrl: "/signout" });
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await fetch("/api/deleteAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Delete account failed with ${response.status}`);
      }

      toast.success("Account deleted", {
        description: "Your account and all of your data have been removed.",
      });
      setDeleteOpen(false);
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't delete your account. Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const themeIcon = mounted ? (
    isDark ? (
      <Sun aria-hidden="true" />
    ) : (
      <Moon aria-hidden="true" />
    )
  ) : (
    <span className="size-4" aria-hidden="true" />
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-h-11 min-w-0 items-center gap-2 rounded-xl pr-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Slax home"
        >
          <span className="bg-playful-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:-rotate-6">
            <Cake className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate text-2xl font-bold tracking-tight">
            Slax
            <span className="text-playful-gradient">.</span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-full px-4 text-sm font-medium"
          >
            <Link href="/about">About</Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {themeIcon}
          </Button>

          {status === "loading" ? (
            <Skeleton className="ml-2 size-9 rounded-full" />
          ) : status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 rounded-full p-0"
                  aria-label="Open account menu"
                >
                  <span className="bg-playful-gradient flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white">
                    {initial}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-60 rounded-xl p-1.5"
              >
                <DropdownMenuLabel className="px-2.5 py-2">
                  <span className="block truncate text-sm font-semibold">
                    {displayName}
                  </span>
                  {email ? (
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {email}
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5"
                  onSelect={() => router.push("/dashboard")}
                >
                  <LayoutDashboard aria-hidden="true" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5"
                  onSelect={() => router.push("/about")}
                >
                  <UserRound aria-hidden="true" />
                  About
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5"
                  onSelect={(event) => {
                    event.preventDefault();
                    toggleTheme();
                  }}
                >
                  {isDark ? (
                    <Sun aria-hidden="true" />
                  ) : (
                    <Moon aria-hidden="true" />
                  )}
                  Toggle theme
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5"
                  onSelect={() => setSignOutOpen(true)}
                >
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-2.5"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 aria-hidden="true" />
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="ml-1 flex items-center gap-1.5">
              <Button
                asChild
                variant="ghost"
                className="h-11 rounded-full px-4"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="bg-brand text-brand-foreground hover:bg-brand/90 h-11 rounded-full px-5"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {themeIcon}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 rounded-full"
                aria-label="Open menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[min(20rem,85vw)] gap-0 p-0"
            >
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 size-11 rounded-full"
                  aria-label="Close menu"
                >
                  <X aria-hidden="true" />
                </Button>
              </SheetClose>
              <SheetHeader className="border-b p-4 pr-14 text-left">
                <SheetTitle className="text-base">Menu</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Navigate Slax and manage your account.
                </SheetDescription>
              </SheetHeader>

              <nav
                aria-label="Mobile"
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
              >
                {status === "authenticated" ? (
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                    <span className="bg-playful-gradient flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>
                      {email ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <Link
                  href="/about"
                  onClick={closeMobile}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  About
                </Link>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {isDark ? (
                    <Sun className="size-4" aria-hidden="true" />
                  ) : (
                    <Moon className="size-4" aria-hidden="true" />
                  )}
                  Toggle theme
                </button>

                {status === "loading" ? (
                  <div className="mt-3 flex flex-col gap-2 border-t pt-4">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ) : status === "authenticated" ? (
                  <div className="mt-3 flex flex-col gap-1 border-t pt-3">
                    <Link
                      href="/dashboard"
                      onClick={closeMobile}
                      className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <LayoutDashboard
                        className="size-4"
                        aria-hidden="true"
                      />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobile();
                        setSignOutOpen(true);
                      }}
                      className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign out
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobile();
                        setDeleteOpen(true);
                      }}
                      className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete account
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2 border-t pt-4">
                    <Button
                      asChild
                      className="h-11 w-full rounded-full"
                      variant="outline"
                    >
                      <Link href="/login" onClick={closeMobile}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-brand text-brand-foreground hover:bg-brand/90 h-11 w-full rounded-full"
                    >
                      <Link href="/signup" onClick={closeMobile}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <WarningModal
        isOpen={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        type="SignOut"
        Callback={handleSignOut}
      />
      <WarningModal
        isOpen={deleteOpen}
        onClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}
        type="DeleteAccount"
        Callback={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </header>
  );
}
