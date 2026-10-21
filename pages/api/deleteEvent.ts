import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { rawEvent } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";
import { deleteEventSchema } from "../../lib/validation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, req.method, ["POST"]);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const parsed = deleteEventSchema.strict().safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      400,
      "Invalid request body",
      parsed.error.flatten()
    );
  }

  try {
    const reminders = (await getDb("Data")).collection<rawEvent>("reminders");

    // Owning user is part of the filter, so another user's reminder is never
    // deleted and looks exactly like a missing one (404).
    const result = await reminders.deleteOne({
      _id: new ObjectId(parsed.data._id),
      user: session.user.email,
    });

    if (!result.acknowledged) {
      throw new Error("Delete was not acknowledged.");
    }

    if (result.deletedCount === 0) {
      return sendError(res, 404, "Birthday not found");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to delete reminder.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
