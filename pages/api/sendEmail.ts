import { timingSafeEqual } from "crypto";
import moment from "moment-timezone";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { getDb } from "../../lib/mongodb";
import {
  buildReminderBuckets,
  REMINDER_TIMEZONE,
  type ReminderEventInput,
} from "../../lib/reminders";
import {
  happyBirthdayEmailHtml,
  reminderEmailHtml,
} from "../../lib/emails/reminder";

/** Subset of `Data.reminders` this endpoint reads. */
interface ReminderDocument {
  name?: unknown;
  date?: unknown;
  user?: unknown;
  isUser?: unknown;
}

/**
 * Constant-time comparison of the cron key. A missing/empty configured key can
 * never authenticate, and differing lengths are rejected before the
 * `timingSafeEqual` call (which throws on unequal buffer sizes).
 */
function isValidKey(provided: unknown, expected: string | undefined): boolean {
  if (typeof expected !== "string" || expected.length === 0) return false;
  if (typeof provided !== "string") return false;
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function isRequestBodyObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

/**
 * Build a valid `From:` header. Never falls back to the bare display name
 * "Slax", which mail servers reject.
 */
function resolveSender(user: string | undefined): string | undefined {
  if (!user) return undefined;
  if (user.includes("<") && user.includes("@")) return user;
  if (user.includes("@")) return `Slax <${user}>`;
  return user;
}

function toReminderEvents(documents: ReminderDocument[]): ReminderEventInput[] {
  const events: ReminderEventInput[] = [];
  for (const doc of documents) {
    if (typeof doc.name !== "string" || doc.name.length === 0) continue;
    if (typeof doc.user !== "string" || doc.user.length === 0) continue;
    const date = doc.date;
    if (!(date instanceof Date) && typeof date !== "string") continue;
    events.push({
      name: doc.name,
      user: doc.user,
      date,
      isUser: doc.isUser === true,
    });
  }
  return events;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      msg: "Only POST is allowed in this Api route",
      code: 405,
    });
  }

  const configuredKey = process.env.key;
  if (!configuredKey) {
    console.error("sendEmail: process.env.key is not configured");
    return res.status(500).json({
      msg: "Oops something went wrong",
      code: 500,
    });
  }

  if (
    !isRequestBodyObject(req.body) ||
    !isValidKey(req.body.key, configuredKey)
  ) {
    return res.status(401).json({
      msg: "Not Authenticated",
      code: 401,
    });
  }

  try {
    // getDb() rejects cleanly when MONGODB_URI is missing or invalid instead of
    // waiting forever on the adapter's never-settling default promise.
    const database = await getDb("Data");
    const collection = database.collection<ReminderDocument>("reminders");
    const data = await collection
      .find(
        {},
        {
          projection: { _id: 0, date: 1, name: 1, user: 1, isUser: 1 },
        }
      )
      .toArray();

    if (data.length === 0) {
      return res.status(200).json({
        msg: "No Documents",
        code: 200,
      });
    }

    // `now` is captured once so every email in a run agrees on "today".
    const now = moment().tz(REMINDER_TIMEZONE);
    const { reminders, selfBirthdays } = buildReminderBuckets(
      toReminderEvents(data),
      now
    );

    // A quiet day needs no mail credentials at all: report a successful no-op
    // so cron callers do not fail when there is simply nothing to send.
    if (reminders.length === 0 && selfBirthdays.length === 0) {
      return res.status(200).json({
        msg: "Done",
        noOfMails: 0,
        UserBirthdays: 0,
        failed: 0,
      });
    }

    const mailUser = process.env.EMAIL_SERVER_USER;
    const mailPassword = process.env.EMAIL_SERVER_PASSWORD;
    if (!mailUser || !mailPassword) {
      console.error(
        "sendEmail: EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD is not configured"
      );
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    const from = resolveSender(mailUser);
    if (!from) {
      console.error("sendEmail: could not resolve a From address");
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });

    // Doing the work inside a promise turns a synchronous nodemailer throw
    // (bad header, missing recipient) into a rejection for allSettled.
    const send = (options: nodemailer.SendMailOptions) =>
      Promise.resolve().then(() => transporter.sendMail(options));

    const reminderSends = reminders.map((mail) =>
      send({
        to: mail.user,
        from,
        subject: "Birthday Reminder from Slax",
        html: reminderEmailHtml(mail.upcoming, mail.today, mail.user),
      })
    );
    const birthdaySends = selfBirthdays.map((birthday) =>
      send({
        to: birthday.user,
        from,
        subject: `Happy Birthday ${birthday.userName}`,
        html: happyBirthdayEmailHtml(birthday.userName),
      })
    );

    // One failing address must not abort the whole batch.
    const results = await Promise.allSettled([
      ...reminderSends,
      ...birthdaySends,
    ]);

    let noOfMails = 0;
    let userBirthdays = 0;
    let failed = 0;
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failed += 1;
        console.error("sendEmail: failed to send email", result.reason);
        return;
      }
      if (index < reminderSends.length) {
        noOfMails += 1;
      } else {
        userBirthdays += 1;
      }
    });

    // Partial delivery is a failure for the caller: cron must retry/report
    // rather than treat a run with rejected recipients as a success.
    if (failed > 0) {
      return res.status(502).json({
        msg: "Some emails failed",
        noOfMails,
        UserBirthdays: userBirthdays,
        failed,
      });
    }

    return res.status(200).json({
      msg: "Done",
      noOfMails,
      UserBirthdays: userBirthdays,
      failed,
    });
  } catch (error) {
    console.error("sendEmail: unexpected failure", error);
    return res.status(500).json({
      msg: "Oops something went wrong",
      code: 500,
    });
  }
}
