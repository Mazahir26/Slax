import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getSession, signIn, useSession } from "next-auth/react";
import { ArrowRight, BellRing, Heart, Mail } from "lucide-react";

import HomePattern from "@/components/home-pattern";
import Footer from "../components/layout/footer";
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
        <HomePattern />

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Never forget birthdays{" "}
              <span className="text-brand">of your loved ones.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create an account, add the birthdays you care about and forget
              about it. We&apos;ll email you three days early, so you can focus
              on planning the surprise. 😉
            </p>

            <div className="mt-9 flex flex-col items-center gap-3">
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
                  <Button
                    size="lg"
                    className="bg-brand text-brand-foreground hover:bg-brand/90 h-12 rounded-full px-7 text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-none!"
                    onClick={() => signIn()}
                  >
                    Create an account
                  </Button>

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

            <ul className="mx-auto mt-14 grid max-w-4xl gap-4 text-left sm:mt-16 sm:grid-cols-3">
              {features.map(({ title, description, Icon }) => (
                <li
                  key={title}
                  className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-colors duration-200 hover:border-brand/30"
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
