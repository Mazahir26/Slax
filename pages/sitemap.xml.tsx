import { GetServerSidePropsContext } from "next";
import fs from "fs";
export default function Sitemap() {
  return null;
}

export const getServerSideProps = ({ res, req }: GetServerSidePropsContext) => {
  const baseUrl =
    process.env.NODE_ENV == "development"
      ? `http://${req.headers.host}`
      : `https://${req.headers.host}`;

  const staticPages = [
    "404",
    "about",
    "dashboard",
    "error",
    "index",
    "login",
    "signout",
    "signup",
    "sitemap.xml",
  ].map((staticPagePath) => {
    return `${baseUrl}/${staticPagePath}`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages
      .map((url) => {
        return `
          <url>
            <loc>${url}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>yearly</changefreq>
            <priority>1.0</priority>
          </url>
        `;
      })
      .join("")}
    </urlset>
  `;
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
