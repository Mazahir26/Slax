import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AuthCard,
  AuthCardSkeleton,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SignOutPage() {
  const { status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/signout" });
    } catch (error) {
      console.error(error);
      toast.error("We couldn't sign you out.", {
        description: "Please check your connection and try again.",
      });
      setIsSigningOut(false);
    }
  }

  return (
    <AuthShell
      title="Sign out | Slax"
      description="Sign out of your Slax account or head back to your dashboard."
    >
      {status === "loading" ? (
        <AuthCardSkeleton rows={1} />
      ) : status === "authenticated" ? (
        <AuthCard className="text-center">
          <div className="mx-auto grid size-16 animate-in place-items-center rounded-2xl bg-destructive/10 text-destructive zoom-in-95 duration-300 fade-in motion-reduce:animate-none">
            <LogOut className="size-8" aria-hidden="true" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Sign out of Slax?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            You&apos;ll need to request a new sign-in link the next time you
            visit. Your birthdays will be waiting for you.
          </p>

          <div className="mt-7 grid gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="h-11 w-full rounded-xl text-base font-semibold"
            >
              {isSigningOut ? (
                <>
                  <Spinner aria-hidden="true" />
                  Signing out…
                </>
              ) : (
                <>
                  <LogOut className="size-4" aria-hidden="true" />
                  Yes, sign out
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full rounded-xl"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Stay signed in
              </Link>
            </Button>
          </div>
        </AuthCard>
      ) : (
        <AuthCard className="text-center sm:p-10">
          <div className="mx-auto grid size-16 animate-in place-items-center rounded-2xl bg-brand/10 text-brand zoom-in-95 duration-300 fade-in motion-reduce:animate-none">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            You&apos;re signed out
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bye for now 👋 Thanks for stopping by. We&apos;ll keep an eye on the
            dates that matter until you&apos;re back.
          </p>

          <div className="mt-7 grid gap-3">
            <Button asChild className="h-11 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90">
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Back to home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full rounded-xl"
            >
              <Link href="/login">Log in again</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Any feedback or suggestions? We&apos;d love to hear them.
          </p>
        </AuthCard>
      )}
    </AuthShell>
  );
}
