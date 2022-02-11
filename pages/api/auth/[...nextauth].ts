import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import client from "../../../lib/mongodb";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
export default NextAuth({
  adapter: MongoDBAdapter(client.connect()),
  secret: "cscshbccsbschbsch",
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      from: "***REMOVED***",
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        });
      },

      server: {
        host: "smtp.gmail.com",
        port: 465,
        requireTLS: true,
        auth: {
          pass: "***REMOVED***",
          user: "***REMOVED***",
        },
      },
    }),
  ],
});

// Email HTML body
function html({ url, host, email }: Record<"url" | "host" | "email", string>) {
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;
  // const escapedHost = `${host.replace(/\./g, "&#8203;.")}`;
  // const backgroundColor = "#02435A";
  // const textColor = "#444444";
  // const mainBackgroundColor = "#ffffff";
  // const buttonBackgroundColor = "#346df1";
  // const buttonBorderColor = "#346df1";
  // const buttonTextColor = "#ffffff";

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
  
  <body style="word-spacing:normal;background-color:#ffffff;">
    <div style="background-color:#ffffff;">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td align="left" class="" style="" ><![endif]-->
                <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575d;">
                  <p style="line-height: 30px; margin: 10px 0; text-align: center;font-size:35px;color:#444444;font-family:'Times New Roman',Helvetica,Arial,sans-serif">Darkest Labs</p>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                    <tbody>
                      <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;padding-top:25px;padding-bottom:30px;word-break:break-word;">
                          <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575d;">
                            <p style="line-height: 30px; text-align: center; margin: 20px 0;font-size:25px;color:#444444;font-family:'sans-serif',Helvetica,Arial,sans-serif"><b>Is this you signing up?</b></p>
                            <p style="line-height: 1px; text-align: center; margin: 0px 0;font-size:20px;color:#444444;font-family:'sans-serif',Helvetica,Arial,sans-serif"><b> ${escapedEmail} </b></p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;padding-bottom:30px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                            <tr>
                              <td align="center" bgcolor="#346df1" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#ffffff;" valign="middle">
                                <p style="display:inline-block;background:#346df1;color:#ffffff;font-family:Times New Roman, Helvetica, Arial, sans-serif;font-size:18px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;">
                                <a  href="${url}" target="_blank" style="text-decoration: none; display: inline-block;">  
                                <span style="color:#eeeeee">Sign in</span>
                                </a>
                                </p>
                              </td>
                            </tr>
                          </table>
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
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:0 0 0 0;padding-bottom:40px;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                    <tbody>
                      <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:20px;word-break:break-word;">
                          <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575d;">
                            <p style="line-height: 28px; text-align: center; margin: 10px 0;color:#444444;font-size:16px;font-family:'sans-serif',Helvetica,Arial,sans-serif"><b>if yes, then click on the button to register.</b><br /></p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;padding-top:5px;padding-bottom:0px;word-break:break-word;">
                          <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575d;">
                            <p style="line-height: 16px; text-align: center; margin: 10px 0;font-size:12px;color:#444444;font-family:'Times New Roman',Helvetica,Arial,sans-serif">This is an automated email; if you received it in error, no action is required.<br /></p>
                          </div>
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

function text({ url, host }: Record<"url" | "host", string>) {
  return `Sign in to ${host}\n${url}\n\n`;
}
