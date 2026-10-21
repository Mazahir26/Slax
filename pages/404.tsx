import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Footer from "../components/layout/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 Not Found | Slax</title>
        <meta name="description" content="The page you were looking for could not be found." />
      </Head>

      <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <Image
          src="/404.svg"
          alt="404 Not Found"
          width={320}
          height={320}
          priority
          className="h-auto w-full max-w-[240px] sm:max-w-[320px]"
        />
        <p className="mt-6 text-sm font-semibold tracking-wide text-brand uppercase">
          404
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted-foreground">
          Are you lost? Let me help you find your way back home.
        </p>
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
