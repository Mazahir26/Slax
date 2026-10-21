import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { emailSchema } from "@/lib/validation";

const emailFormSchema = z.object({
  email: emailSchema,
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

const COPY = {
  login: {
    badge: "Welcome back",
    heading: "Log in to Slax",
    description:
      "We're passwordless 😎 — we'll email you a secure sign-in link, so there's nothing to remember.",
    submit: "Email me a sign-in link",
    prompt: "New to Slax?",
    linkLabel: "Create an account",
    linkHref: "/signup",
  },
  signup: {
    badge: "Get started",
    heading: "Create your account",
    description:
      "Start remembering the birthdays that matter. We'll send you a secure sign-in link — no password needed.",
    submit: "Email me a sign-in link",
    prompt: "Already have an account?",
    linkLabel: "Log in",
    linkHref: "/login",
  },
} as const;

type AuthFormProps = {
  mode: "login" | "signup";
};

/**
 * Passwordless email form shared by /login and /signup. NextAuth sends the
 * magic link and redirects to /verification on success.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const copy = COPY[mode];
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: EmailFormValues) {
    try {
      // NextAuth redirects to /verification (the configured verifyRequest page)
      // after the email has been sent.
      const result = await signIn("email", {
        email: values.email,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("We couldn't send your sign-in link.", {
        description: "Check your connection and try again.",
      });
    }
  }

  return (
    <AuthCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {copy.badge}
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {copy.heading}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.description}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder="you@example.com"
                        className="h-11 rounded-xl pl-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all duration-200 hover:bg-brand/90 focus-visible:ring-brand/40 active:scale-[0.99] motion-reduce:active:scale-none!"
            >
              {isSubmitting ? (
                <>
                  <Spinner aria-hidden="true" />
                  Sending link…
                </>
              ) : (
                <>
                  {copy.submit}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          {copy.prompt}{" "}
          <Link
            href={copy.linkHref}
            className="inline-flex min-h-11 items-center rounded-md px-1 font-semibold text-brand underline-offset-4 transition-colors duration-200 hover:text-accent-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {copy.linkLabel}
          </Link>
        </p>

        <div className="flex items-start gap-2.5 rounded-2xl bg-muted/60 p-3.5">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-brand"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Secure and passwordless. We&apos;ll never ask you for a password,
            and you can use the link once.
          </p>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to Slax&apos;s Terms of Service and
          acknowledge that Slax&apos;s Privacy Policy applies to you.
        </p>
      </div>
    </AuthCard>
  );
}
