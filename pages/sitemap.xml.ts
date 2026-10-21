import type { GetServerSideProps } from "next";

const FALLBACK_BASE_URL = "https://slax.studio";

/** Loopback hostnames that are safe to trust while developing locally. */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

interface PublicRoute {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}

/** Public, indexable pages only. Auth, dashboard and error pages stay out. */
const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/signup", changefreq: "monthly", priority: "0.5" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Accept a configured base URL, keeping only its origin. */
function configuredBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * The `Host` header is attacker-controlled, so it may only influence canonical
 * URLs during local development and only when it points at loopback. In
 * production every request uses the configured origin or the fixed fallback.
 */
function localDevBaseUrl(host: string | undefined): string | null {
  if (process.env.NODE_ENV === "production") return null;

  const trimmed = host?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(`http://${trimmed}`);
    if (!LOCAL_HOSTNAMES.has(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function resolveBaseUrl(host: string | undefined): string {
  return (
    configuredBaseUrl(process.env.NEXTAUTH_URL) ??
    configuredBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    localDevBaseUrl(host) ??
    FALLBACK_BASE_URL
  );
}

function absoluteUrl(baseUrl: string, path: string): string {
  if (path === "/") return `${baseUrl}/`;
  return `${baseUrl}${path}`;
}

export default function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const baseUrl = resolveBaseUrl(req.headers.host);
  const lastmod = new Date().toISOString();

  const urls = PUBLIC_ROUTES.map((route) => {
    const loc = escapeXml(absoluteUrl(baseUrl, route.path));
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.end(sitemap);

  return { props: {} };
};
