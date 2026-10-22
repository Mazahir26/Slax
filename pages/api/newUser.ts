import type { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { methodNotAllowed, requireSession, sendError } from "../../lib/api";
import { getDb } from "../../lib/mongodb";

type UserDocument = {
  _id: ObjectId;
  email: string;
  isNew?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return methodNotAllowed(res, req.method, ["GET", "POST"]);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  try {
    const users = (await getDb("auth")).collection<UserDocument>("users");
    const email = session.user.email;

    if (req.method === "GET") {
      const user = await users.findOne(
        { email },
        { projection: { _id: 1, email: 1, isNew: 1 } }
      );

      if (!user) {
        return sendError(res, 404, "User not found");
      }

      return res.status(200).json({
        email: user.email,
        isNew: user.isNew !== false,
      });
    }

    const result = await users.updateOne(
      { email },
      {
        $set: {
          isNew: false,
        },
      },
      {
        upsert: false,
      }
    );

    if (!result.acknowledged) {
      throw new Error("Onboarding update was not acknowledged.");
    }

    if (result.matchedCount === 0) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json({
      msg: "Done",
      code: 200,
    });
  } catch (error) {
    console.error("Failed to load or update the user.", error);
    return sendError(res, 500, "Oops something went wrong");
  }
}
