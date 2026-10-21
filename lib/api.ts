import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/** A session whose user is guaranteed to have an email address. */
export type AuthenticatedSession = Session & {
  user: Session["user"] & { email: string };
};

function isAuthenticated(
  session: Session | null
): session is AuthenticatedSession {
  return typeof session?.user?.email === "string" && session.user.email.length > 0;
}

/** Send a JSON error body. `msg`/`code` are always present; `errors` is optional. */
export function sendError(
  res: NextApiResponse,
  status: number,
  message: string,
  errors?: unknown
) {
  const body: { msg: string; code: number; errors?: unknown } = {
    msg: message,
    code: status,
  };
  if (errors !== undefined) body.errors = errors;
  return res.status(status).json(body);
}

/** Send a 405 response that advertises the methods the route supports. */
export function methodNotAllowed(
  res: NextApiResponse,
  method: string | undefined,
  allow: readonly string[]
) {
  res.setHeader("Allow", allow.join(", "));
  return sendError(
    res,
    405,
    `${method ?? "This method"} is not allowed on this route`
  );
}

/**
 * Resolve the signed-in user for a Pages API route.
 *
 * Returns `null` after sending a consistent 401 response, so callers can simply
 * `if (!session) return;`.
 */
export async function requireSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedSession | null> {
  const session = await getServerSession(req, res, authOptions);
  if (!isAuthenticated(session)) {
    sendError(res, 401, "You need to be authenticated");
    return null;
  }
  return session;
}
