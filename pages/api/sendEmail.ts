import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb";
import { event } from "../../components/types";
import moment from "moment";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!req.body.key) {
      return res.status(401).json({
        msg: "Not Authenticated",
        code: 401,
      });
    }

    if (req.body.key != process.env.key) {
      return res.status(401).json({
        msg: "Not Authenticated",
        code: 401,
      });
    }

    try {
      const cli = await client;
      const database = cli.db("Data");
      const collection = database.collection<event>("reminders");
      const cursor = collection.find(
        {},
        {
          projection: { _id: 0, date: 1, name: 1, user: 1 },
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
        x.date = moment(x.date.toISOString()).set("years", moment().year());
      });

      let mails: {
        user: string;
        upcoming: string[];
        today: string[];
      }[] = [];

      const obj: string[] = data
        .map((item) => item.user)
        .filter((value, index, self) => self.indexOf(value) === index);

      obj.map((value) => {
        const userReminders = data.filter((val) => val.user === value);
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
          .map(
            (x) => `${x.name}'s birthday on ${x.date.format("Do [of] MMM")}.`
          );
        const Upcoming = userReminders
          .sort((a, b) =>
            moment(a.date)
              .set("year", moment().year())
              .diff(moment(b.date).set("year", moment().year()))
          )
          .filter(
            (x) =>
              x.date.date() - moment().date() <= 3 &&
              x.date.date() - moment().date() > 0 &&
              x.date.month() === moment().month()
          )
          .map(
            (x) => `${x.name}'s birthday on ${x.date.format("Do [of] MMM")}.`
          );
        if (Upcoming.length > 0 || Today.length > 0) {
          mails.push({
            user: value,
            today: Today,
            upcoming: Upcoming,
          });
        }
      });
      // const promise = mails.map(async (x) => {
      //   return sendMail(x.user, x.upcoming, x.today);
      // });
      // await Promise.all(promise);
      console.log(moment().toString(), moment().toISOString());
      return res.status(200).json({
        msg: "Done",
        noOfMails: mails.length,
        mails: mails,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
        err: e,
      });
    }
  } else {
    return res.status(400).json({
      msg: "Only POST is allowed in this Api route",
      code: 400,
    });
  }
}

async function sendMail(user: string, Upcoming: string[], Today: string[]) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    throw Error("Please make sure you have updated .env.local file");
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // no need to set host or port etc.
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
    return await transporter.sendMail({
      to: user,
      from: "Slax",
      subject: "Birthday Reminder from Slax",
      html: html(Upcoming, Today, user),
    });
  } catch (error) {
    console.log(error);
    throw Error("Email not sent");
  }
}

function html(Upcoming: string[], birthdaysToday: string[], user: string) {
  const nameMatch = user.match(/^([^@]*)@/);
  const name = nameMatch ? nameMatch[1] : null;
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
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
</head>

<body style="word-spacing:normal;">
  <div style="">
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
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:160px;">
                                <img height="auto" src="https://slax.vercel.app/logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="160" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Helvetica,Arial, sans-serif;font-size:24px;font-weight:bold;line-height:1;text-align:center;color:#000000;">Hey ${
                          name ? name : user
                        },</div>
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
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word;">
                    <div style="font-family:Helvetica,Arial, sans-serif;font-size:20px;font-weight:bold;line-height:1;text-align:center;color:#000000;">Make sure you wish them today</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word;">
                  ${birthdaysToday.map(
                    (x) =>
                      `<div style="font-family:Helvetica, sans-serif;font-size:15px;line-height:1;text-align:center;color:#000000;">${x}</div>`
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
    : ``
}
 ${
   Upcoming.length > 0
     ? `   <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
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
                     <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word;">
                       <div style="font-family:Helvetica,Arial, sans-serif;font-size:20px;font-weight:bold;line-height:1;text-align:center;color:#000000;">Upcoming Birthdays</div>
                     </td>
                   </tr>
                   <tr>
                     <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word;">
                     ${Upcoming.map(
                       (x) =>
                         `<div style="font-family:Helvetica, sans-serif;font-size:15px;line-height:1;text-align:center;color:#000000;">${x}</div>`
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
     : ``
 }
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
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
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:14px;word-break:break-word;">
                      <div style="font-family:Helvetica, sans-serif;font-size:15px;line-height:1;text-align:center;color:#000000;">This is an automated email, if you don't want to hear from us you may login to <a style="text-decoration:none;color:#2a88f3" href="www.slax.studio">slax</a> and delete your account. Thank You</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:10px;word-break:break-word;">
                        <div style="font-family:Helvetica, sans-serif;font-size:15px;line-height:1;text-align:center;color:#000000;">©2022 Slax. All rights reserved</div>
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
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>`;
}
