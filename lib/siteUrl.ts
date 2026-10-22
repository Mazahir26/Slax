/**
 * Canonical site origin resolution shared by `/robots.txt` and `/sitemap.xml`.
 *
 * The `Host` header is attacker-controlled, so it may only influence the
 * origin during local development and only when it points at a loopback host.
 * Production always uses an explicitly configured origin or the fixed fallback,
 * while Vercel Preview deployments use Vercel's system environment
 * (`VERCEL_BRANCH_URL` / `VERCEL_URL`) for their own deployment origin.
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

/**
 * Origin of the current Vercel Preview deployment.
 *
 * Preview deployments get a unique hostname per deployment (`VERCEL_URL`) and a
 * stable hostname per branch (`VERCEL_BRANCH_URL`). Vercel exposes both without
 * a protocol. Only Vercel's own system environment is trusted here; the request
 * `Host` header is never consulted outside local development.
 *
 * Returns null outside a Vercel Preview deployment or when the value is not a
 * valid origin.
 */
export function vercelPreviewOrigin(): string | null {
  if (process.env.VERCEL_ENV !== "preview") return null;

  const candidate = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  const trimmed = candidate?.trim();
  if (!trimmed) return null;

  // Vercel system variables omit the protocol; accept one if it is present.
  return /^https?:\/\//i.test(trimmed)
    ? normalizeOrigin(trimmed)
    : normalizeOrigin(`https://${trimmed}`);
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
 * `NEXTAUTH_URL`, then the current Vercel Preview deployment, then loopback
 * hosts during development, then the fallback.
 *
 * In production the request `Host` header is ignored, so a spoofed header
 * cannot change generated links.
 */
export function resolveSiteUrl(host?: string): string {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.NEXTAUTH_URL) ??
    vercelPreviewOrigin() ??
    localDevOrigin(host) ??
    FALLBACK_SITE_URL
  );
}
