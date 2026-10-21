import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import type { rawEvent } from "../../components/types";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";

type AuthUser = {
  _id: ObjectId;
  email: string;
};

function assertAcknowledged(result: { acknowledged: boolean }) {
  if (!result.acknowledged) {
    throw new Error("Database delete was not acknowledged.");
  }
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

  const email = session.user.email;

  try {
    const dataDb = await getDb("Data");
    const authDb = await getDb("auth");
    const users = authDb.collection<AuthUser>("users");

    // The NextAuth adapter stores `accounts`/`sessions` by the user's ObjectId,
    // so resolve it before removing anything.
    const user = await users.findOne(
      { email },
      { projection: { _id: 1 } }
    );

    assertAcknowledged(
      await dataDb.collection<rawEvent>("reminders").deleteMany({ user: email })
    );

    if (user) {
      assertAcknowledged(
        await authDb.collection("accounts").deleteMany({ userId: user._id })
      );
      assertAcknowledged(
        await authDb.collection("sessions").deleteMany({ userId: user._id })
      );
    }

    assertAcknowledged(
      await authDb
        .collection("verification_tokens")
        .deleteMany({ identifier: email })
    );

    // If the user document was already gone we still cleaned up reminders and
    // tokens above and report success with deletedCount: 0.
    const result = await users.deleteMany({ email });
    assertAcknowledged(result);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to delete account.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
