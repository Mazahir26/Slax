import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb";
import { event } from "../../components/types";
import moment from "moment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const curTime = parseInt(moment().format("kkmm"));
  if (!(curTime > 800 && curTime < 900)) {
    return res.status(400).json({
      msg: "Not the right time",
      code: 400,
    });
  }

  if (req.method === "GET") {
    try {
      const cli = await client.connect();
      const database = cli.db("Data");
      const collection = database.collection<event>("reminders");
      const cursor = collection.find(
        {},
        {
          projection: { _id: 0, date: 1, name: 1, user: 1, color: 0 },
        }
      );
      const data = await cursor.toArray();
      if (data.length === 0) {
        return res.status(200).json({
          msg: "No Documents",
          code: 200,
        });
      }
      data.map((x) => {
        x.date = moment(x.date);
      });

      let sentEmails: string[] = [];
      let mails: {
        user: string;
        upcoming: string[];
        today: string[];
      }[] = [];
      data.map((x) => {
        if (!sentEmails.includes(x.user)) {
          const userReminders = data.filter(
            (val) =>
              val.user === x.user &&
              Math.abs(
                moment().diff(val.date.set("years", moment().year()), "days")
              ) <= 3
          );
          if (userReminders.length === 0) {
            return;
          }
          const Today = userReminders
            .filter((x) => x.date.format("MMM,D") === moment().format("MMM,D"))
            .sort((a, b) =>
              a.name.toUpperCase() > b.name.toUpperCase()
                ? 1
                : b.name.toUpperCase() > a.name.toUpperCase()
                ? -1
                : 0
            )
            .map((x) => `${x.name}'s Birthday.`);

          const Upcoming = userReminders
            .sort((a, b) =>
              moment(a.date)
                .set("year", moment().year())
                .diff(moment(b.date).set("year", moment().year()))
            )
            .filter((x) => x.date.format("MM,D") != moment().format("MM,D"))
            .map(
              (x) => `${x.name}'s birthday on ${x.date.format("Do [of] MMM")}.`
            );
          mails.push({
            user: userReminders[0].user,
            today: Today,
            upcoming: Upcoming,
          });
          sentEmails.push(userReminders[0].user);
        }
      });
      mails.map((x) => {
        sendMail(x.user, x.upcoming, x.today);
      });
      await cli.close();
      return res.status(200).json({
        msg: "Done",
      });
    } catch (e) {
      return res.status(500).json({
        msg: "Ops something went wrong",
        code: 500,
        err: e,
      });
    }
  } else {
    return res.status(400).json({
      msg: "Only GET is allowed in this Api route",
      code: 400,
    });
  }
}

async function sendMail(user: string, Upcoming: string[], Today: string[]) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // no need to set host or port etc.
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  try {
    return await transporter.sendMail({
      to: user,
      from: "Slax",
      subject: "Daily Reminder from Slax",
      html: html(Upcoming, Today),
    });
  } catch (error) {
    console.log(error);
    throw Error("Email not sent");
  }
}

function html(Upcoming: string[], birthdaysToday: string[]) {
  return `<!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> 
  <head>
    <title>
    </title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
  
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
  
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
  
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if mso]>
          <noscript>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          </noscript>
          <![endif]-->
    <!--[if lte mso 11]>
          <style type="text/css">
            .mj-outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style media="screen and (min-width:480px)">
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>
    <style type="text/css">
    </style>
  </head>
  
  <body style="word-spacing:normal;background-color:#F4F4F4;">
    <div style="background-color:#F4F4F4;">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Quicksand, Arial, sans-serif;font-size:50px;font-weight:bold;line-height:1;text-align:center;color:#1a7ef2;">SLAX</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <p style="border-top:solid 4px #cccccc;font-size:1px;margin:0px auto;width:100%;">
                          </p>
                          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #cccccc;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
  </td></tr></table><![endif]-->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
${
  birthdaysToday.length > 0
    ? `<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin:0px auto;max-width:600px;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
              <tbody>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                    <div style="font-family:helvetica;font-size:30px;line-height:1;text-align:left;color:#333333;">Birthdays Today</div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-left:8%;word-break:break-word;">
                  ${birthdaysToday.map(
                    (x) =>
                      `<div style="font-family:helvetica;font-size:25px;line-height:1;text-align:left;color:#333333;">${x}</div>`
                  )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
</div>`
    : ""
}
${
  Upcoming.length > 0
    ? `<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin:0px auto;max-width:600px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tbody>
                        <tr>
                          <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:helvetica;font-size:30px;line-height:1;text-align:left;color:#333333;">Upcoming Birthdays</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="font-size:0px;padding:10px 25px;padding-left:8%;word-break:break-word;">
                          ${Upcoming.map(
                            (x) =>
                              `<div style="font-family:helvetica;font-size:25px;line-height:1;text-align:left;color:#333333;">${x}</div>`
                          )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>`
    : ""
}
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
  </body>
  </html>`;
}
