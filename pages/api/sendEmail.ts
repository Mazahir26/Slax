import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb";
import { event } from "../../components/types";
import moment from "moment";
import SMTPTransport from "nodemailer/lib/smtp-transport";
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
    const todayDay = moment().utc().utcOffset("+05:30.");
    try {
      const cli = await client;
      const database = cli.db("Data");
      const collection = database.collection<event>("reminders");
      const cursor = collection.find(
        {},
        {
          projection: { _id: 0, date: 1, name: 1, user: 1, isUser: 1 },
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
      let userMails: {
        user: string;
        userName: string;
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
          .filter(
            (x) =>
              x.date.utc().utcOffset("+05:30.").format("MMM,D") ===
              todayDay.format("MMM,D")
          )
          .filter((x) => x.isUser !== true)
          .sort((a, b) =>
            a.name.toUpperCase() > b.name.toUpperCase()
              ? 1
              : b.name.toUpperCase() > a.name.toUpperCase()
              ? -1
              : 0
          )
          .map((x) => `${x.name}.`);

        const Upcoming = userReminders
          .sort((a, b) =>
            moment(a.date)
              .set("year", moment().year())
              .diff(moment(b.date).set("year", moment().year()))
          )
          .filter(
            (x) =>
              x.date.utc().utcOffset("+05:30.").date() - todayDay.date() <= 3 &&
              x.date.utc().utcOffset("+05:30.").date() - todayDay.date() > 0 &&
              x.date.utc().utcOffset("+05:30.").month() === todayDay.month()
          )
          .filter((x) => x.isUser !== true)
          .map(
            (x) =>
              `${x.name}'s birthday on ${x.date
                .utc()
                .utcOffset("+05:30.")
                .format("Do [of] MMM")}.`
          );
        const isUserBirthday = userReminders
          .filter(
            (x) =>
              x.date.utc().utcOffset("+05:30.").format("MMM,D") ===
              todayDay.format("MMM,D")
          )
          .filter((x) => x.isUser == true);
        if (Upcoming.length > 0 || Today.length > 0) {
          mails.push({
            user: value,
            today: Today,
            upcoming: Upcoming,
          });
        }
        if (isUserBirthday.length > 0) {
          userMails.push({
            user: value,
            userName: isUserBirthday[0].name,
          });
        }
      });

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
      const promise = mails.map(async (x) => {
        return sendMail(x.user, x.upcoming, x.today, transporter);
      });
      const userPromise = userMails.map(async (x) => {
        return sendUserMail(x.user, x.userName, transporter);
      });

      await Promise.all(promise);
      await Promise.all(userPromise);
      return res.status(200).json({
        msg: "Done",
        noOfMails: mails.length,
        UserBirthdays: userMails.length,
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

async function sendMail(
  user: string,
  Upcoming: string[],
  Today: string[],
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>
) {
  try {
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
async function sendUserMail(
  user: string,
  userName: string,
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>
) {
  try {
    return await transporter.sendMail({
      to: user,
      from: "Slax",
      subject: `Happy Birthday ${userName}`,
      html: UserHtml(userName),
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

function UserHtml(UserName: string) {
  return `
<!doctype html>
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
                              <td style="width:100px;">
                                <img height="auto" src="https://slax.vercel.app/logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="100" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-top:80px;word-break:break-word;">
                        <div style="font-family:helvetica;font-size:35px;line-height:1;text-align:center;color:#000000;">Happy Birthday ${UserName}</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-top:40px;word-break:break-word;">
                        <div style="font-family:sans-serif,Arial,Georgia,Helvetica;font-size:15px;line-height:20px;text-align:center;color:#000000;">Hold Tight!!! Your life is about to blast into the stratosphere. 10, 9, 8, 7, 6, 5, 4, 3. 2 1 HAPPY BIRTHDAY!! P.S. don't forget your seatbelt.</div>
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
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-top:30px;word-break:break-word;">
                        <div style="font-family:helvetica;font-size:15px;line-height:1;text-align:center;color:#000000;">This is an automated email, if you don't want to hear from us you may login to <a href="www.slax.vercel.app" style="text-decoration:none;color:#2a88f3">Slax</a> and delete your account. Thank You</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-top:10px;word-break:break-word;">
                        <div style="font-family:helvetica;font-size:15px;line-height:1;text-align:center;color:#000000;">©2022 Slax. All rights reserved</div>
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
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>

`;
}
