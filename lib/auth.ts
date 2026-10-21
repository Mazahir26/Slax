import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { createMongoAdapter } from "@/lib/mongoAdapter";
import { signInEmailHtml, signInEmailText } from "@/lib/emails/auth";

// Environment is read once per module load (normal for serverless runtimes).
// Nothing throws at import time so `next build` can run without secrets.
const emailHost = process.env.EMAIL_SERVER_HOST?.trim() ?? "";
const emailUser = process.env.EMAIL_SERVER_USER?.trim() ?? "";
const emailPassword = process.env.EMAIL_SERVER_PASSWORD ?? "";
const parsedPort = Number.parseInt(process.env.EMAIL_SERVER_PORT ?? "", 10);
const emailPort = Number.isFinite(parsedPort) ? parsedPort : 0;

const emailFrom = emailUser ? `Slax <${emailUser}>` : "Slax <no-reply@localhost>";

/** Validate the email settings when a sign-in email is actually requested. */
function assertEmailConfig() {
  const missing: string[] = [];
  if (!emailHost) missing.push("EMAIL_SERVER_HOST");
  if (emailPort <= 0) missing.push("EMAIL_SERVER_PORT");
  if (!emailUser) missing.push("EMAIL_SERVER_USER");
  if (!emailPassword) missing.push("EMAIL_SERVER_PASSWORD");

  if (missing.length > 0) {
    throw new Error(
      `Email is not configured. Set ${missing.join(", ")} before sending sign-in emails.`
    );
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signup",
    verifyRequest: "/verification",
    signOut: "/signout",
    error: "/error",
    newUser: "/onboarding",
  },
  adapter: createMongoAdapter("auth"),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },

  providers: [
    EmailProvider({
      from: emailFrom,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        assertEmailConfig();

        try {
          const { host } = new URL(url);
          const transport = nodemailer.createTransport(server);
          await transport.sendMail({
            to: email,
            from,
            subject: `Sign in to ${host}`,
            text: signInEmailText({ url, host }),
            html: signInEmailHtml({ url, host, email }),
          });
        } catch (error: unknown) {
          console.error("Failed to send the sign-in email.", error);
          throw new Error(
            "Could not send the sign-in email. Please try again later."
          );
        }
      },
      server: {
        host: emailHost,
        port: emailPort,
        requireTLS: true,
        auth: {
          pass: emailPassword,
          user: emailUser,
        },
      },
    }),
  ],
};
