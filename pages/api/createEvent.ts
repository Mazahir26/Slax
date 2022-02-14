import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { rawEvent } from "../../components/types";
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
  if (req.method === "POST") {
    if (!req.body.name || !req.body.date || !req.body.color) {
      return res.status(400).json({
        msg: "Bad Request",
        code: 400,
      });
    }
    try {
      const cli = await client;
      const database = cli.db("Data");
      const reminders = database.collection<rawEvent>("reminders");
      if (!session?.user?.email)
        return res.status(401).json({
          msg: "You need to be authenticated",
          code: 401,
        });
      const result = await reminders.insertOne({
        date: new Date(req.body.date),
        name: req.body.name,
        user: session?.user?.email,
        color: req.body.color,
      });
      cli.close();
      return res.status(201).json(result);
    } catch (e) {
      return res.status(500).json({
        msg: "Ops something went wrong",
        code: 500,
      });
    }
  } else {
    return res.status(400).json({
      msg: "Get is not allowed in this Api route",
      code: 400,
    });
  }
}
