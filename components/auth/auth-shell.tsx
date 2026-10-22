import Head from "next/head";
import Link from "next/link";
import { BellRing, MailCheck, Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Footer from "../layout/footer";

type AuthShellProps = {
  /** Document title, rendered through next/head. */
  title: string;
  description?: string;
  children: React.ReactNode;
};

const HIGHLIGHTS = [
  {
    icon: BellRing,
    title: "Gentle reminders",
    copy: "Get a nudge before the big day, never after it.",
  },
  {
    icon: MailCheck,
    title: "Passwordless by design",
    copy: "One secure link in your inbox — nothing to remember.",
  },
];

/**
 * Shared frame for every auth-related page: a centered, max-w-md card with a
 * playful supporting panel on large screens and the site footer underneath.
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

      <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-x-hidden bg-background">
        <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="relative grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
            <aside className="relative hidden min-h-[34rem] animate-in flex-col justify-between overflow-hidden rounded-[2rem] bg-brand p-10 text-brand-foreground shadow-sm duration-500 fade-in motion-reduce:animate-none lg:flex">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(currentColor 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />

              <Link
                href="/"
                className="group relative inline-flex w-fit items-center rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-foreground/60"
              >
                <span className="text-2xl font-bold tracking-tight">Slax</span>
              </Link>

              <div className="relative space-y-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase ring-1 ring-brand-foreground/20">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Made for the moments that matter
                </span>
                <h2 className="max-w-sm text-4xl font-bold leading-[1.1] tracking-tight">
                  Never miss a birthday again.
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-brand-foreground sm:text-base">
                  Slax keeps track of the dates your people care about, then
                  reminds you at exactly the right moment.
                </p>
                <ul className="space-y-3 pt-1">
                  {HIGHLIGHTS.map(({ icon: Icon, title: itemTitle, copy }) => (
                    <li key={itemTitle} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-brand-foreground/15 ring-1 ring-brand-foreground/20">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">
                          {itemTitle}
                        </span>
                        <span className="block text-sm text-brand-foreground">
                          {copy}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="relative text-sm text-brand-foreground">
                Free to use. Private by default. Made with care.
              </p>
            </aside>

            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
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
