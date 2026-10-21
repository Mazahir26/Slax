import { ObjectId } from "mongodb";
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
    throw new Error("Database operation was not acknowledged.");
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
  // The adapter stores `accounts`/`sessions` keyed by ObjectId. Fall back to
  // the raw token value if an older/foreign token carries a non-ObjectId id.
  const userId = ObjectId.isValid(session.user.id)
    ? new ObjectId(session.user.id)
    : session.user.id;

  try {
    const dataDb = await getDb("Data");
    const authDb = await getDb("auth");
    const users = authDb.collection<AuthUser>("users");

    // Revoke outstanding tokens before removing the data. The account is then
    // rejected by `requireSession` during the (very small) window before the
    // user document is deleted.
    const user = await users.findOne({ email }, { projection: { _id: 1 } });
    if (user) {
      assertAcknowledged(
        await users.updateOne(
          { _id: user._id },
          { $set: { isDisabled: true }, $inc: { tokenVersion: 1 } }
        )
      );
    }

    assertAcknowledged(
      await dataDb.collection<rawEvent>("reminders").deleteMany({ user: email })
    );

    // Sessions/accounts are keyed by the stable user id from the JWT, so they
    // are removed even when the user document has already gone missing.
    assertAcknowledged(
      await authDb.collection("accounts").deleteMany({ userId })
    );
    assertAcknowledged(
      await authDb.collection("sessions").deleteMany({ userId })
    );

    assertAcknowledged(
      await authDb
        .collection("verification_tokens")
        .deleteMany({ identifier: email })
    );

    // Remove the user document last: while it exists, `requireSession` still
    // rejects the account because `isDisabled` is set.
    const result = await users.deleteMany({ email });
    assertAcknowledged(result);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to delete account.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
