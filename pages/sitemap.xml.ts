import type { GetServerSideProps } from "next";
import { resolveSiteUrl } from "@/lib/siteUrl";

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

function absoluteUrl(baseUrl: string, path: string): string {
  if (path === "/") return `${baseUrl}/`;
  return `${baseUrl}${path}`;
}

export default function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const baseUrl = resolveSiteUrl(req.headers.host);
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
