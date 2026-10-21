import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { eventData } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";

type ReminderDocument = {
  _id: ObjectId;
  name: string;
  date: Date;
  user: string;
  color: string;
  isUser?: boolean;
};

type UserDocument = {
  _id: ObjectId;
  email: string;
  isNew?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, req.method, ["GET"]);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  try {
    const reminders = (await getDb("Data")).collection<ReminderDocument>(
      "reminders"
    );
    const users = (await getDb("auth")).collection<UserDocument>("users");

    const rows = await reminders
      .find(
        { user: session.user.email },
        {
          projection: {
            _id: 1,
            date: 1,
            name: 1,
            user: 1,
            color: 1,
            isUser: 1,
          },
        }
      )
      .toArray();

    // Same meaning as GET /api/newUser: the account is onboarding while
    // `auth.users.isNew` is anything other than an explicit `false`.
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { _id: 1, isNew: 1 } }
    );
    const isNewUser = user?.isNew !== false;

    // Self-birthday reminders are private to onboarding/email flows and are
    // intentionally hidden from the dashboard list.
    const result: eventData[] = rows
      .filter((row) => row.isUser !== true)
      .map((row) => ({
        _id: row._id.toString(),
        name: row.name,
        date: new Date(row.date).toISOString(),
        user: row.user,
        color: row.color,
      }));

    return res.status(200).json({ result, isNewUser });
  } catch (error) {
    console.error("Failed to load reminders.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
