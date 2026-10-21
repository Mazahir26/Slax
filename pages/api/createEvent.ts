import type { Collection, ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { rawEvent } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";
import { createEventSchema } from "../../lib/validation";

type OnboardingUser = {
  _id: ObjectId;
  email: string;
  isNew?: boolean;
};

/**
 * Decide whether this reminder may be stored as the user's own birthday.
 *
 * Client input is never trusted for `isUser`. It is only honoured while the
 * account is still onboarding (`auth.users.isNew !== false`) and the user does
 * not already have a self-birthday reminder. This keeps the onboarding
 * self-birthday email working without letting a client mark arbitrary events
 * as "self" at any later point.
 */
async function canStoreSelfBirthday(
  email: string,
  reminders: Collection<rawEvent>
): Promise<boolean> {
  const users = (await getDb("auth")).collection<OnboardingUser>("users");
  const user = await users.findOne(
    { email },
    { projection: { _id: 1, isNew: 1 } }
  );

  if (!user || user.isNew === false) return false;

  const existing = await reminders.findOne(
    { user: email, isUser: true },
    { projection: { _id: 1 } }
  );

  return existing === null;
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

  const parsed = createEventSchema.strict().safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      400,
      "Invalid request body",
      parsed.error.flatten()
    );
  }

  const email = session.user.email;
  const { name, date, color } = parsed.data;

  try {
    const reminders = (await getDb("Data")).collection<rawEvent>("reminders");

    const isUser =
      parsed.data.isUser === true
        ? await canStoreSelfBirthday(email, reminders)
        : false;

    const result = await reminders.insertOne({
      date,
      name,
      user: email,
      color,
      isUser,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to create reminder.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
