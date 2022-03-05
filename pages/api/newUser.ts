import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next/types";
import client from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookie = req.headers.cookie;
  const session = cookie
    ? await getSession({ req: { headers: { cookie } } as any })
    : null;
  if (!session) {
    return res.status(401).send({
      msg: "You need to be authenticated",
      code: 401,
    });
  }
  if (!session?.user?.email)
    return res.status(401).send({
      msg: "Invalid Token",
      code: 401,
    });

  try {
    const cli = await client;
    const database = cli.db("auth");
    const users = database.collection<{
      _id: ObjectId;
      email: string;
      emailVerified: string;
      isNew?: boolean;
    }>("users");
    if (req.method === "GET") {
      const response = await users.findOne(
        {
          email: session.user.email,
        },
        {
          projection: {
            _id: 1,
            email: 1,
            isNew: 1,
          },
        }
      );
      if (!response) {
        return res.status(500).json({
          msg: "Oops something went wrong",
          code: 500,
        });
      }
      if (response.isNew === false) {
        return res.status(200).json({
          email: response.email,
          isNew: false,
        });
      } else {
        return res.status(200).json({
          email: response.email,
          isNew: true,
        });
      }
    } else if (req.method === "POST") {
      const result = await users.updateOne(
        {
          email: session.user.email,
        },
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
        throw new Error("Not Acknowledged");
      }
      return res.status(200).json({
        msg: "Done",
        code: 200,
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      msg: "Oops something went wrong",
      code: 500,
    });
  }
}
