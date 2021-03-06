import moment from "moment";
import { WithId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { eventData } from "../../components/types";
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
  if (req.method === "GET") {
    try {
      const cli = await client;
      const database = cli.db("Data");
      const reminders = database.collection<eventData>("reminders");
      const cursor = reminders.find(
        {
          user: session.user.email,
        },
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
      );
      let result = await cursor.toArray();
      result.map((x) => {
        x.date = moment(x.date).toISOString();
        x._id = x._id.toString();
      });
      const isNewUser = result.filter((ele) => ele.isUser === true).length > 0;
      result = result.filter((ele) => {
        if (!(ele.isUser === true)) {
          return ele;
        }
      });
      return res.status(200).json({
        result,
        isNewUser,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }
  } else {
    return res.status(400).json({
      msg: "only Get allowed in this Api route",
      code: 400,
    });
  }
}
