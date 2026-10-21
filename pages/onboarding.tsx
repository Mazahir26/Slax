import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Cake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  AuthCard,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validation";
import { addEvent, getUser } from "../lib/helperFunctions";

// Raw form shape from the shared schema. The date stays a string while the
// user types; zod validates it and normalises it to a YYYY-MM-DD date key
// before onSubmit sees it.
type OnboardingFormValues = z.input<typeof onboardingSchema>;

async function markOnboardingComplete() {
  const response = await fetch("/api/newUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to complete onboarding (${response.status})`);
  }
}

/** Mirrors the finished card's layout so the page does not jump on load. */
function OnboardingSkeleton() {
  return (
    <AuthCard aria-busy="true" aria-live="polite">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="space-y-3">
          <Skeleton className="size-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-52 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl bg-muted/30 p-3.5">
          <Skeleton className="size-4 shrink-0 rounded" />
          <div className="w-full space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </AuthCard>
  );
}

export default function OnboardingPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [skipPending, setSkipPending] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }, []);

  const form = useForm<OnboardingFormValues, unknown, OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      date: "",
    },
    mode: "onTouched",
  });
  const { isSubmitting } = form.formState;
  const isBusy = isSubmitting || skipPending;

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const user = await getUser();

        if (!active) {
          return;
        }

        if (user.isNew === false) {
          void router.replace("/dashboard");
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error(error);

        if (!active) {
          return;
        }

        toast.error("We couldn't load your profile.", {
          description: "Please try again in a moment.",
        });
        void router.replace("/error?error=ServerError");
      }
    })();

    return () => {
      active = false;
    };
  }, [status, router]);

  async function onSubmit(values: OnboardingInput) {
    if (isBusy) {
      return;
    }

    const email = session?.user?.email;

    if (!email) {
      toast.error("We couldn't find your account.", {
        description: "Please sign in again to continue.",
      });
      return;
    }

    try {
      await addEvent({
        name: values.name,
        date: moment(values.date),
        color: "#F1BF98",
        email,
        isUser: true,
      });
      await markOnboardingComplete();

      toast.success("Birthday added. 🎉", {
        description: "Welcome to Slax — let's make every birthday count.",
      });
      await router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't save your birthday. Please try again.",
      });
    }
  }

  async function handleSkip() {
    if (isBusy) {
      return;
    }

    setSkipPending(true);
    try {
      await markOnboardingComplete();

      toast.success("You're all set!", {
        description: "You can add your birthday anytime from your dashboard.",
      });
      await router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't finish setting up your account. Please try again.",
      });
    } finally {
      setSkipPending(false);
    }
  }

  if (status === "loading" || checking) {
    return (
      <AuthShell
        title="Welcome | Slax"
        description="Finish setting up your Slax account."
      >
        <OnboardingSkeleton />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome | Slax"
      description="Add your birthday and finish setting up your Slax account."
    >
      <AuthCard>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Quick setup
            </span>
            <span className="text-xs text-muted-foreground">
              Takes 20 seconds
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid size-12 animate-in place-items-center rounded-2xl bg-playful-gradient text-white shadow-lg shadow-brand/20 zoom-in-95 duration-300 fade-in motion-reduce:animate-none">
              <Cake className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Welcome to Slax
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Add your birthday — your birthday is important to us! 😁
                We&apos;ll use it to send you a little celebration every year.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              aria-busy={isBusy}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="name"
                        placeholder="e.g. Saitama"
                        className="h-11 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  const dateValue =
                    typeof field.value === "string" ? field.value : "";

                  return (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={dateValue}
                          type="date"
                          max={today}
                          autoComplete="bday"
                          className="h-11 rounded-xl [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </FormControl>
                      <FormDescription>
                        We&apos;ll only use this to celebrate you every year.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isBusy}
                  className="h-11 rounded-xl"
                >
                  {skipPending ? (
                    <>
                      <Spinner aria-hidden="true" />
                      Skipping…
                    </>
                  ) : (
                    "Skip"
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={isBusy}
                  className="h-11 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-lg shadow-brand/20 hover:bg-brand/90"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="flex items-start gap-2.5 rounded-2xl bg-muted/60 p-3.5">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your birthday is private and only used for your own reminders.
              You can skip this step and add it later.
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
