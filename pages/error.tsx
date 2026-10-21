import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import Footer from "../components/layout/footer";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const { query } = useRouter();
  const error = typeof query.error === "string" ? query.error : undefined;

  return (
    <>
      <Head>
        <title>Error | Slax</title>
        <meta
          name="description"
          content="Something went wrong while loading Slax. Please try again."
        />
      </Head>

      <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <Image
          src="/warning.svg"
          alt="Something went wrong"
          width={320}
          height={320}
          className="h-auto w-full max-w-[240px] sm:max-w-[320px]"
        />
        <p className="mt-6 text-sm font-semibold tracking-wide text-brand uppercase">
          Oops
        </p>
        <h1 className="mt-2 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Something went wrong, try again later.
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted-foreground">
          We hit an unexpected snag while loading this page.
        </p>
        {error ? (
          <p className="mt-4 max-w-md rounded-2xl bg-muted px-4 py-2 text-xs break-words text-muted-foreground">
            {error}
          </p>
        ) : null}
        <Button
          asChild
          className="bg-brand text-brand-foreground hover:bg-brand/90 mt-8 h-11 rounded-full px-6"
        >
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Go to Home
          </Link>
        </Button>
      </section>

      <Footer />
    </>
  );
}
