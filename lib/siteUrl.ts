/**
 * Canonical site origin resolution shared by `/robots.txt` and `/sitemap.xml`.
 *
 * The `Host` header is attacker-controlled, so it may only influence the
 * origin during local development and only when it points at a loopback host.
 * Production always uses an explicitly configured origin or the fixed fallback.
 */

export const FALLBACK_SITE_URL = "https://slax.vercel.app";

/** Loopback hostnames that are safe to trust while developing locally. */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

/** Normalize a configured URL to its origin, or return null when unusable. */
export function normalizeOrigin(value: string | undefined | null): string | null {
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

/** Trust a request host only in development and only for loopback names. */
function localDevOrigin(host: string | undefined): string | null {
  if (process.env.NODE_ENV !== "development") return null;

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

/**
 * Resolve the canonical origin: `NEXT_PUBLIC_SITE_URL` takes precedence over
 * `NEXTAUTH_URL`, then loopback hosts during development, then the fallback.
 */
export function resolveSiteUrl(host?: string): string {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.NEXTAUTH_URL) ??
    localDevOrigin(host) ??
    FALLBACK_SITE_URL
  );
}
