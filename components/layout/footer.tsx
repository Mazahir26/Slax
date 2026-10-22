import Link from "next/link";
import type { SVGProps } from "react";

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2h3.68l-8.04 9.19L24 22h-7.4l-5.8-7.58L4.17 22H.48l8.6-9.83L0 2h7.59l5.24 6.93L18.9 2Zm-1.29 17.8h2.04L6.49 4.08H4.3L17.61 19.8Z" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Mazahir26",
    Icon: GithubIcon,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/mazahir_najmi",
    Icon: TwitterIcon,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col items-center gap-1 text-center text-sm text-muted-foreground sm:flex-row sm:gap-2.5 sm:text-left">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-brand focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Slax
          </Link>
          <span className="hidden text-border sm:inline" aria-hidden="true">
            /
          </span>
          <p className="truncate">
            © {year} Slax. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-1"
        >
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-brand focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            About
          </Link>
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-brand motion-reduce:hover:translate-none! focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
