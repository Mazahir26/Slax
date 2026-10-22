import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { eventData } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { toDateKey } from "../../lib/dateOnly";
import { getDb } from "../../lib/mongodb";

type ReminderDocument = {
  _id: ObjectId;
  name: string;
  /** New records store a date key; legacy records store a BSON Date. */
  date: string | Date;
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
    const result: eventData[] = [];
    for (const row of rows) {
      if (row.isUser === true) continue;

      // Every API response uses the date-key model. Legacy BSON Dates are
      // converted to their IST calendar date here so the client never has to
      // deal with timestamps.
      const date = toDateKey(row.date);
      if (date === null) {
        console.error(
          `Skipping reminder ${row._id.toString()} with an invalid date.`
        );
        continue;
      }

      result.push({
        _id: row._id.toString(),
        name: row.name,
        date,
        user: row.user,
        color: row.color,
      });
    }

    return res.status(200).json({ result, isNewUser });
  } catch (error) {
    console.error("Failed to load reminders.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
