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
 * One unique self-birthday per user, enforced by the database instead of a
 * read-then-write check that concurrent onboarding retries can race through.
 * The promise is cached so the index is only ensured once per process.
 */
let selfBirthdayIndexPromise: Promise<void> | null = null;

function ensureSelfBirthdayIndex(
  reminders: Collection<rawEvent>
): Promise<void> {
  if (!selfBirthdayIndexPromise) {
    selfBirthdayIndexPromise = reminders
      .createIndex(
        { user: 1 },
        {
          unique: true,
          partialFilterExpression: { isUser: true },
          name: "unique_user_self_birthday",
        }
      )
      .then(() => undefined)
      .catch((error: unknown) => {
        // Do not cache a failed build; a later request may succeed.
        selfBirthdayIndexPromise = null;
        throw error;
      });
  }
  return selfBirthdayIndexPromise;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/** Find the account's self-birthday, if any. */
function findSelfBirthday(
  reminders: Collection<rawEvent>,
  email: string
) {
  return reminders.findOne(
    { user: email, isUser: true },
    { projection: { _id: 1 } }
  );
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
  const wantsSelfBirthday = parsed.data.isUser === true;

  try {
    const reminders = (await getDb("Data")).collection<rawEvent>("reminders");

    // Ordinary birthdays may always be created. Only an explicit self-birthday
    // request can create a self-birthday.
    if (!wantsSelfBirthday) {
      const result = await reminders.insertOne({
        date,
        name,
        user: email,
        color,
        isUser: false,
      });
      return res.status(201).json(result);
    }

    // Build the unique index only for self-birthday creation. Ordinary event
    // creation must not fail because pre-existing duplicate birthdays block
    // the index build (cleaning those up is a deployment prerequisite).
    await ensureSelfBirthdayIndex(reminders);

    // Onboarding retries must be safe: return the existing self-birthday before
    // considering the current onboarding flag. This is true regardless of
    // whether `isNew` was already flipped to false by another request.
    const existing = await findSelfBirthday(reminders, email);
    if (existing) {
      return res
        .status(201)
        .json({ acknowledged: true, insertedId: existing._id });
    }

    const users = (await getDb("auth")).collection<OnboardingUser>("users");
    const user = await users.findOne(
      { email },
      { projection: { _id: 1, isNew: 1 } }
    );
    const onboardingCompleted = user !== null && user.isNew === false;

    if (onboardingCompleted) {
      // A concurrent request may have inserted the self-birthday after our
      // first read but before the onboarding flag was observed. Recheck once
      // so a delayed retry still succeeds idempotently...
      const raced = await findSelfBirthday(reminders, email);
      if (raced) {
        return res
          .status(201)
          .json({ acknowledged: true, insertedId: raced._id });
      }

      // ...but never downgrade the request to an ordinary `isUser:false`
      // birthday. Onboarding already finished without one, so refuse.
      return sendError(res, 409, "Onboarding already completed");
    }

    try {
      const result = await reminders.insertOne({
        date,
        name,
        user: email,
        color,
        isUser: true,
      });

      return res.status(201).json(result);
    } catch (error: unknown) {
      // The unique partial index is the final arbiter. A concurrent request
      // that inserted the self-birthday first makes this a duplicate; treat it
      // as the same idempotent success shape.
      if (isDuplicateKeyError(error)) {
        const winner = await findSelfBirthday(reminders, email);
        if (winner) {
          return res
            .status(201)
            .json({ acknowledged: true, insertedId: winner._id });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to create reminder.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
