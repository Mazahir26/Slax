import type { GetServerSideProps } from "next";
import { resolveSiteUrl } from "@/lib/siteUrl";

export default function Robots() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const siteUrl = resolveSiteUrl(req.headers.host);
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${siteUrl}/sitemap.xml`, ""].join(
    "\n"
  );

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);

  return { props: {} };
};
