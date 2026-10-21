import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const NOT_CONFIGURED_MESSAGE = "Authentication is not configured.";

function hasMongoUri(): boolean {
  const uri = process.env.MONGODB_URI?.trim();
  return uri !== undefined && /^mongodb(\+srv)?:\/\//.test(uri);
}

function hasAuthSecret(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    (process.env.NEXTAUTH_SECRET?.trim().length ?? 0) > 0
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!hasMongoUri()) {
    console.error(
      "Cannot handle authentication: MONGODB_URI is missing or invalid."
    );
    return res
      .status(500)
      .json({ msg: NOT_CONFIGURED_MESSAGE, code: 500 });
  }

  if (!hasAuthSecret()) {
    console.error(
      "Cannot handle authentication: NEXTAUTH_SECRET is missing in production."
    );
    return res
      .status(500)
      .json({ msg: NOT_CONFIGURED_MESSAGE, code: 500 });
  }

  try {
    await NextAuth(req, res, authOptions);
  } catch (error: unknown) {
    console.error("Authentication request failed.", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ msg: "Authentication failed. Please try again.", code: 500 });
    }
  }
}
