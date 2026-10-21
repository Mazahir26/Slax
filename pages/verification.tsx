import Link from "next/link";
import { Clock, MailCheck, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { AuthCard, AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function VerificationPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      void router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <AuthShell
      title="Check your inbox | Slax"
      description="Your Slax sign-in link is on its way. It stays valid for 12 hours."
    >
      <AuthCard className="text-center sm:p-10">
        <div className="mx-auto grid size-16 animate-in place-items-center rounded-2xl bg-playful-gradient text-white shadow-lg shadow-brand/20 zoom-in-95 duration-300 fade-in motion-reduce:animate-none">
          <MailCheck className="size-8" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          We&apos;ve sent a secure sign-in link to your email. Just one more
          step 😁
        </p>

        <div className="mt-6 rounded-2xl border bg-muted/50 p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">The link is valid for 12 hours</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You can safely close this tab and open the link whenever
                you&apos;re ready.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Can&apos;t find it? Check your spam or promotions folder before
          requesting a new link.
        </p>

        <Button
          asChild
          variant="outline"
          className="mt-6 h-11 w-full rounded-xl"
        >
          <Link href="/login">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to log in
          </Link>
        </Button>
      </AuthCard>
    </AuthShell>
  );
}
