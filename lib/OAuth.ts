import { google } from "googleapis";

if (
  !process.env.REFRESH_TOKEN ||
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.REDIRECT_URI
) {
  throw Error(" Credentials not found");
}

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
export default oauth2Client;
