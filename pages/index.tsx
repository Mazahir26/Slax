import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getSession, signIn, useSession } from "next-auth/react";
import { ArrowRight, BellRing, Heart, Mail, Sparkles } from "lucide-react";

import Footer from "../components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Email reminders",
    description: "Every birthday lands in your inbox, on all of your devices.",
    Icon: Mail,
  },
  {
    title: "3-day heads-up",
    description: "A gentle nudge three days early, so you have time to plan.",
    Icon: BellRing,
  },
  {
    title: "Free forever",
    description: "Open source, ad-free and no catch. Just birthdays.",
    Icon: Heart,
  },
];

const Home: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Slax — Birthday reminders for the people you love</title>
        <meta
          name="description"
          content="Create an account, add birthdays and forget about it. Slax emails you three days before every birthday so you can plan something special."
        />
      </Head>

      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-32 -left-24 size-72 rounded-full bg-brand/20 blur-3xl sm:size-96" />
          <div className="absolute top-10 -right-24 size-72 rounded-full bg-accent-pink/20 blur-3xl sm:size-96" />
          <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-brand/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="animate-in gap-1.5 rounded-full border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Birthday reminders, on autopilot
            </Badge>

            <h1 className="mt-6 animate-in text-balance text-4xl font-bold tracking-tight fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-backwards motion-reduce:animate-none sm:text-5xl lg:text-6xl">
              Never forget birthdays{" "}
              <span className="text-playful-gradient">
                of your loved ones.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl animate-in text-pretty text-base leading-relaxed text-muted-foreground fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards motion-reduce:animate-none sm:text-lg">
              Create an account, add the birthdays you care about and forget
              about it. We&apos;ll email you three days early, so you can focus
              on planning the surprise. 😉
            </p>

            <div className="mt-9 flex animate-in flex-wrap items-center justify-center gap-x-3 gap-y-2 fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-backwards motion-reduce:animate-none">
              {status === "authenticated" ? (
                <Button
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90 h-12 rounded-full px-7 text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-none!"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="lg"
                      className="bg-brand text-brand-foreground hover:bg-brand/90 h-12 rounded-full px-7 text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-none!"
                      onClick={() => signIn()}
                    >
                      Create an account
                    </Button>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none mx-1 hidden items-center gap-1 select-none sm:flex"
                    >
                      <svg
                        width="46"
                        height="30"
                        viewBox="0 0 46 30"
                        fill="none"
                        className="text-muted-foreground/70"
                        aria-hidden="true"
                      >
                        <path
                          d="M43 25c-10 3-24-1-33-13"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 12 9 20M10 12l7 4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-display -translate-y-2 rotate-6 text-2xl text-muted-foreground">
                        it&apos;s free
                      </span>
                    </span>
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/login">Have an account? Sign in</Link>
                  </Button>
                </>
              )}
            </div>

            <ul className="mx-auto mt-14 grid max-w-4xl animate-in gap-4 text-left fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-backwards motion-reduce:animate-none sm:mt-16 sm:grid-cols-3">
              {features.map(({ title, description, Icon }) => (
                <li
                  key={title}
                  className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:hover:translate-none!"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-none!">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Home;
