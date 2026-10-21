import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { rawEvent } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";
import { editEventSchema } from "../../lib/validation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, req.method, ["POST"]);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const parsed = editEventSchema.strict().safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      400,
      "Invalid request body",
      parsed.error.flatten()
    );
  }

  const { _id, name, date, color } = parsed.data;

  try {
    const reminders = (await getDb("Data")).collection<rawEvent>("reminders");

    // Scope by owner as well as id: a reminder that belongs to someone else is
    // indistinguishable from a missing one (404), so ids cannot be probed.
    const result = await reminders.updateOne(
      { _id: new ObjectId(_id), user: session.user.email },
      {
        $set: {
          name,
          color,
          date,
        },
      },
      {
        upsert: false,
      }
    );

    if (!result.acknowledged) {
      throw new Error("Update was not acknowledged.");
    }

    if (result.matchedCount === 0) {
      return sendError(res, 404, "Birthday not found");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to update reminder.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
