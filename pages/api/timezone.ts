import moment from "moment-timezone";
import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { isValidTimeZone } from "../../lib/dateOnly";
import { getDb } from "../../lib/mongodb";

/** Only the fields this route reads or writes. */
interface UserDocument {
  _id: ObjectId;
  email: string;
  timezone?: string | null;
}

/** Maximum accepted timezone length (longest IANA names are far shorter). */
const MAX_TIMEZONE_LENGTH = 64;

function isRequestBodyObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, req.method, ["POST"]);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const body = req.body;
  if (!isRequestBodyObject(body) || typeof body.timezone !== "string") {
    return sendError(res, 400, "Invalid timezone");
  }

  const timezone = body.timezone.trim();
  if (
    timezone.length === 0 ||
    timezone.length > MAX_TIMEZONE_LENGTH ||
    !isValidTimeZone(timezone) ||
    // `Intl` and moment-timezone ship different zone databases. Reject names
    // only `Intl` knows so every stored zone stays usable by the sender.
    !moment.tz.zone(timezone)
  ) {
    return sendError(res, 400, "Invalid timezone");
  }

  try {
    const users = (await getDb("auth")).collection<UserDocument>("users");
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { _id: 1, timezone: 1 } }
    );

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // A valid stored timezone is authoritative and is never overwritten by a
    // later request, so concurrent onboarding retries stay idempotent.
    if (isValidTimeZone(user.timezone)) {
      return res.status(200).json({
        updated: false,
        timezone: user.timezone,
      });
    }

    const isMissingOrEmpty =
      user.timezone === undefined ||
      user.timezone === null ||
      user.timezone === "";

    if (isMissingOrEmpty) {
      // Only fill the field if nobody else claimed it first. The conditional
      // update is what prevents two onboarding tabs from overwriting the
      // first stored timezone.
      const updated = await users.findOneAndUpdate(
        {
          _id: user._id,
          $or: [
            { timezone: { $exists: false } },
            { timezone: null },
            { timezone: "" },
          ],
        },
        { $set: { timezone } },
        { returnDocument: "after", includeResultMetadata: false }
      );

      if (updated) {
        return res.status(200).json({
          updated: true,
          timezone: updated.timezone ?? timezone,
        });
      }

      const current = await users.findOne(
        { _id: user._id },
        { projection: { timezone: 1 } }
      );
      if (!current) {
        return sendError(res, 404, "User not found");
      }

      return res.status(200).json({
        updated: false,
        timezone:
          typeof current.timezone === "string" && current.timezone.length > 0
            ? current.timezone
            : timezone,
      });
    }

    // A non-empty but invalid stored value (for example an old client writing
    // garbage) is repaired once. `modifiedCount` tells the caller whether the
    // value actually changed, which keeps a repeated request idempotent.
    const result = await users.updateOne(
      { _id: user._id },
      { $set: { timezone } }
    );

    const stored = await users.findOne(
      { _id: user._id },
      { projection: { timezone: 1 } }
    );
    if (!stored) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json({
      updated: result.modifiedCount > 0,
      timezone: stored.timezone ?? timezone,
    });
  } catch (error: unknown) {
    // Never include the account or stored values in logs.
    console.error(
      "Failed to update the timezone.",
      error instanceof Error ? error.name : "unknown error"
    );
    return sendError(res, 500, "Oops something went wrong");
  }
}
