import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

/** A session whose user is guaranteed to have an id and an email address. */
export type AuthenticatedSession = Session & {
  user: Session["user"] & { id: string; email: string };
};

type AuthUser = {
  _id: ObjectId;
  isDisabled?: boolean;
};

function isAuthenticated(
  session: Session | null
): session is AuthenticatedSession {
  return (
    typeof session?.user?.email === "string" && session.user.email.length > 0
  );
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
 * Besides validating the JWT, this checks that the account still exists and is
 * not disabled in `auth.users`. Deleting an account therefore revokes its
 * outstanding JWTs immediately instead of waiting for them to expire.
 *
 * Returns `null` after sending a consistent 401/500 response, so callers can
 * simply `if (!session) return;`.
 */
export async function requireSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedSession | null> {
  let session: Session | null;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (error: unknown) {
    console.error("Could not resolve the authentication session.", error);
    if (!res.headersSent) {
      sendError(res, 500, "Could not verify your account. Please try again.");
    }
    return null;
  }

  if (!isAuthenticated(session)) {
    sendError(res, 401, "You need to be authenticated");
    return null;
  }

  let user: Pick<AuthUser, "_id" | "isDisabled"> | null;
  try {
    const users = (await getDb("auth")).collection<AuthUser>("users");
    user = await users.findOne(
      { email: session.user.email },
      { projection: { _id: 1, isDisabled: 1 } }
    );
  } catch (error: unknown) {
    console.error("Could not verify the signed-in account.", error);
    sendError(res, 500, "Could not verify your account. Please try again.");
    return null;
  }

  if (!user || user.isDisabled === true) {
    sendError(res, 401, "You need to be authenticated");
    return null;
  }

  // JWTs created before `uid` was added still need a usable id. The database
  // document id is the same value the adapter would put in the token.
  const id =
    typeof session.user.id === "string" && session.user.id.length > 0
      ? session.user.id
      : user._id.toHexString();

  return {
    ...session,
    user: {
      ...session.user,
      id,
    },
  };
}
