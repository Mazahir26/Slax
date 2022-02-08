import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // no need to set host or port etc.
      auth: {
        user: "***REMOVED***",
        pass: "***REMOVED***",
      },
    });
    try {
      const data = await transporter.sendMail({
        to: "supermazahir@gmail.com",
        from: "***REMOVED***",
        subject: "Signup verification",
        html: '<h1>Please verify your email</h1><a href="www.google.com">',
      });
      console.log("Email can be sent", data);
    } catch (error) {
      console.log(error);
    }
  }

  res.status(200).json({ name: `John Doe` });
}
