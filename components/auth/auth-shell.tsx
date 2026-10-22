import Head from "next/head";

import { PatternBackground } from "@/components/pattern-background";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Footer from "../layout/footer";

type AuthShellProps = {
  /** Document title, rendered through next/head. */
  title: string;
  description?: string;
  children: React.ReactNode;
};

/**
 * Shared frame for every auth-related page: a centered, max-w-md card with the
 * site footer underneath.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? (
          <meta name="description" content={description} />
        ) : null}
      </Head>

      <div className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-background">
        <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <PatternBackground />

          <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>

        <Footer />
      </div>
    </>
  );
}

/** The card every auth page renders its content inside. */
export function AuthCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-in rounded-3xl border bg-card p-6 text-card-foreground shadow-xl shadow-brand/5 fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none sm:p-8",
        className
      )}
      {...props}
    />
  );
}

/** Loading placeholder with the same footprint as a typical auth card. */
export function AuthCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <AuthCard aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-8 space-y-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </AuthCard>
  );
}
