import Head from "next/head";
import {
  Database,
  ExternalLink,
  Heart,
  Layers,
  Mail,
  MonitorSmartphone,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Footer from "../components/layout/footer";

const features = [
  {
    title: "Birthday reminder with email",
    description:
      "We send an email to every device you use — three days before the big day — so you still have time to plan something special.",
    Icon: Mail,
    accent: "bg-brand/10 text-brand",
  },
  {
    title: "Free forever",
    description:
      "Yes, it's open source and free, no catch. Not to mention ad-free. Find a bug or a missing feature? Reach out on GitHub.",
    Icon: Heart,
    accent: "bg-accent-pink/10 text-accent-pink",
  },
  {
    title: "Intuitive design",
    description:
      "Simple, playful and responsive by design. Slax looks and works great on every screen you use.",
    Icon: Sparkles,
    accent: "bg-brand/10 text-brand",
  },
  {
    title: "One account, multi device",
    description:
      "Use as many devices as you like to access the same account. There is no limit on devices per account.",
    Icon: MonitorSmartphone,
    accent: "bg-accent-pink/10 text-accent-pink",
  },
];

const tech = [
  {
    name: "Next.js",
    description: "The React framework powering Slax.",
    href: "https://nextjs.org/",
    Icon: Layers,
  },
  {
    name: "Tailwind CSS + shadcn/ui",
    description: "For a clean, playful and accessible interface.",
    href: "https://ui.shadcn.com/",
    Icon: Palette,
  },
  {
    name: "NextAuth.js",
    description: "Simple, secure email authentication.",
    href: "https://next-auth.js.org/",
    Icon: ShieldCheck,
  },
  {
    name: "MongoDB",
    description: "Where your birthdays are safely stored.",
    href: "https://www.mongodb.com/",
    Icon: Database,
  },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About | Slax</title>
        <meta
          name="description"
          content="Learn what Slax does, why it is free forever, and the technology behind it."
        />
      </Head>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <header className="mx-auto max-w-2xl animate-in text-center fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">
            About Slax
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Birthdays, handled with{" "}
            <span className="text-playful-gradient">care.</span>
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Slax is a tiny app with one job: making sure the people you love get
            remembered. No clutter, no ads, no forgotten birthdays.
          </p>
        </header>

        <section aria-labelledby="features-heading" className="mt-16 sm:mt-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="features-heading"
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Features
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything you need, and nothing you don&apos;t.
              </p>
            </div>
          </div>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, Icon, accent }) => (
              <li
                key={title}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-md motion-reduce:transform-none motion-reduce:translate-none"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none motion-reduce:scale-none ${accent}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tech-heading" className="mt-16 sm:mt-20">
          <h2
            id="tech-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Technology used
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Built with modern, open tools and a lot of care.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tech.map(({ name, description, href, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md motion-reduce:transform-none motion-reduce:translate-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground transition-all duration-200 group-hover:scale-105 group-hover:bg-brand/10 group-hover:text-brand motion-reduce:transform-none motion-reduce:scale-none">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <span className="font-semibold">{name}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-brand">
                    Visit site
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </>
  );
}
