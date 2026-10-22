import { timingSafeEqual } from "crypto";
import moment from "moment-timezone";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import {
  claimDelivery,
  ensureDeliveryIndexes,
  markDeliveryFailed,
  markDeliverySent,
  releaseDelivery,
  type DeliveryKind,
} from "../../lib/deliveryLog";
import {
  buildBirthdayEmail,
  buildReminderEmail,
} from "../../lib/emails/reminder";
import { getDb } from "../../lib/mongodb";
import {
  buildReminderBuckets,
  isSafeEmailRecipient,
  safeReminderTimeZone,
  type ReminderEventInput,
  type ReminderMail,
  type SelfBirthdayMail,
} from "../../lib/reminders";
import { resolveSiteUrl } from "../../lib/siteUrl";

/** Subset of `Data.reminders` this endpoint reads. */
interface ReminderDocument {
  name?: unknown;
  date?: unknown;
  user?: unknown;
  isUser?: unknown;
}

/** Subset of `auth.users` this endpoint reads. */
interface UserDocument {
  email?: unknown;
  timezone?: unknown;
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

/** Validated SMTP settings. Ports outside 1..65535 are never dialed. */
interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

function resolveMailConfig(): MailConfig | null {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const password = process.env.EMAIL_SERVER_PASSWORD;
  const rawPort = process.env.EMAIL_SERVER_PORT?.trim();

  if (!host || !user || !password || !rawPort) return null;
  if (!/^\d+$/.test(rawPort)) return null;

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;

  return { host, port, user, password };
}

function toReminderEvents(documents: ReminderDocument[]): ReminderEventInput[] {
  const events: ReminderEventInput[] = [];
  for (const doc of documents) {
    if (typeof doc.name !== "string" || doc.name.length === 0) continue;
    // Skip malformed stored addresses rather than handing them to the mailer.
    if (!isSafeEmailRecipient(doc.user)) continue;
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

function groupEventsByUser(
  events: ReminderEventInput[]
): Map<string, ReminderEventInput[]> {
  const grouped = new Map<string, ReminderEventInput[]>();
  for (const event of events) {
    const existing = grouped.get(event.user);
    if (existing) {
      existing.push(event);
    } else {
      grouped.set(event.user, [event]);
    }
  }
  return grouped;
}

/** Everything due for one recipient on their own local day. */
interface DueUser {
  user: string;
  timezone: string;
  localDate: string;
  reminders: ReminderMail[];
  selfBirthdays: SelfBirthdayMail[];
}

/** One email whose content is ready to be claimed and sent. */
interface PlannedSend {
  kind: DeliveryKind;
  user: string;
  localDate: string;
  options: SendMailOptions;
}

/**
 * SMTP/network failures that prove the message never left our side. Only these
 * may release a claim for a later retry; everything else is ambiguous because
 * the server may already have accepted the message.
 */
const PRE_DELIVERY_ERROR_CODES = new Set([
  "EAUTH",
  "ECONNECTION",
  "EENVELOPE",
  "EMESSAGE",
  "EDNS",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPROTO",
]);

/**
 * Nodemailer puts SMTP/network codes on `code`. Keep only a short, uppercase
 * token so no message text or recipient data can reach the database or logs.
 */
function sanitizeSmtpErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  const raw = (error as { code?: unknown }).code;
  if (typeof raw !== "string") return undefined;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9_]{1,32}$/.test(code) ? code : undefined;
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "unknown error";
}

/**
 * Build every message before any claim is taken. A template/header failure
 * therefore aborts the run with zero claims instead of stranding later ones.
 */
function buildPlannedSends(
  dueUsers: DueUser[],
  from: string,
  siteUrl: string
): PlannedSend[] {
  const planned: PlannedSend[] = [];

  for (const due of dueUsers) {
    if (due.reminders.length > 0) {
      const reminder = due.reminders[0];
      const content = buildReminderEmail({
        user: due.user,
        today: reminder.today,
        upcoming: reminder.upcoming,
        timezone: due.timezone,
        siteUrl,
      });
      planned.push({
        kind: "reminder",
        user: due.user,
        localDate: due.localDate,
        options: {
          to: due.user,
          from,
          subject: content.subject,
          html: content.html,
          text: content.text,
        },
      });
    }

    if (due.selfBirthdays.length > 0) {
      const birthday = due.selfBirthdays[0];
      const content = buildBirthdayEmail({
        user: due.user,
        name: birthday.userName,
        timezone: due.timezone,
        siteUrl,
      });
      planned.push({
        kind: "birthday",
        user: due.user,
        localDate: due.localDate,
        options: {
          to: due.user,
          from,
          subject: content.subject,
          html: content.html,
          text: content.text,
        },
      });
    }
  }

  return planned;
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

  const body = req.body;
  if (body.dryRun !== undefined && typeof body.dryRun !== "boolean") {
    return res.status(400).json({
      msg: "dryRun must be a boolean",
      code: 400,
    });
  }
  const dryRun = body.dryRun === true;

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

    // Timezone is optional on legacy accounts; a missing/invalid value falls
    // back to the original Asia/Kolkata behaviour.
    const users = await (await getDb("auth"))
      .collection<UserDocument>("users")
      .find({}, { projection: { _id: 0, email: 1, timezone: 1 } })
      .toArray();

    const timezoneByEmail = new Map<string, unknown>();
    for (const row of users) {
      if (typeof row.email !== "string" || row.email.length === 0) continue;
      if (!timezoneByEmail.has(row.email)) {
        timezoneByEmail.set(row.email, row.timezone);
      }
    }

    const dueUsers: DueUser[] = [];
    const eventsByUser = groupEventsByUser(toReminderEvents(data));

    for (const [user, userEvents] of eventsByUser) {
      // Use the moment-aware guard: a zone `Intl` accepts but moment-timezone
      // does not know would otherwise throw inside `moment().tz(...)`.
      const timezone = safeReminderTimeZone(timezoneByEmail.get(user));
      // `now` is captured per user so "today" is that user's local day.
      const localNow = moment().tz(timezone);
      const localDate = localNow.format("YYYY-MM-DD");
      const { reminders, selfBirthdays } = buildReminderBuckets(
        userEvents,
        localNow,
        timezone
      );

      if (reminders.length === 0 && selfBirthdays.length === 0) continue;

      dueUsers.push({
        user,
        timezone,
        localDate,
        reminders,
        selfBirthdays,
      });
    }

    const wouldSendReminders = dueUsers.reduce(
      (total, due) => total + due.reminders.length,
      0
    );
    const wouldSendBirthdays = dueUsers.reduce(
      (total, due) => total + due.selfBirthdays.length,
      0
    );

    // A dry run reports what a real run would do without claiming, sending or
    // even requiring SMTP credentials.
    if (dryRun) {
      return res.status(200).json({
        msg: "Dry run",
        wouldSendReminders,
        wouldSendBirthdays,
        users: dueUsers.length,
        failed: 0,
      });
    }

    // A quiet day needs no mail credentials at all: report a successful no-op
    // so cron callers do not fail when there is simply nothing to send.
    if (dueUsers.length === 0) {
      return res.status(200).json({
        msg: "Done",
        noOfMails: 0,
        UserBirthdays: 0,
        failed: 0,
        skipped: 0,
      });
    }

    const mail = resolveMailConfig();
    if (!mail) {
      console.error(
        "sendEmail: EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD must be configured and valid"
      );
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    const from = resolveSender(mail.user);
    if (!from) {
      console.error("sendEmail: could not resolve a From address");
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    const siteUrl = resolveSiteUrl();

    // Claims are only safe once the unique index exists.
    await ensureDeliveryIndexes(database);

    // Build every body before taking a single claim. A template failure here
    // aborts the run with zero claims, so nothing can be stranded.
    let planned: PlannedSend[];
    try {
      planned = buildPlannedSends(dueUsers, from, siteUrl);
    } catch (buildError: unknown) {
      console.error(
        "sendEmail: could not build email content",
        errorName(buildError)
      );
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    // Port 465 uses implicit TLS; every other port negotiates STARTTLS.
    const secure = mail.port === 465;
    const transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure,
      requireTLS: !secure,
      auth: {
        user: mail.user,
        pass: mail.password,
      },
    });

    // Acquire every claim before the first SMTP send. Track only the claims
    // this run actually owns so an error can release exactly those.
    const acquired: PlannedSend[] = [];
    let skipped = 0;

    try {
      for (const sendPlan of planned) {
        const claimed = await claimDelivery(
          database,
          sendPlan.user,
          sendPlan.localDate,
          sendPlan.kind
        );
        if (claimed) {
          acquired.push(sendPlan);
        } else {
          skipped += 1;
        }
      }
    } catch (claimError: unknown) {
      console.error(
        "sendEmail: could not acquire delivery claims",
        errorName(claimError)
      );
      // No SMTP send has started, so every claim from this run is safe to
      // release. Do it best-effort: a failed release only delays a retry.
      const releases = await Promise.allSettled(
        acquired.map((sendPlan) =>
          releaseDelivery(
            database,
            sendPlan.user,
            sendPlan.localDate,
            sendPlan.kind
          )
        )
      );
      for (const release of releases) {
        if (release.status === "rejected") {
          console.error(
            "sendEmail: could not release a claim after a claim failure",
            errorName(release.reason)
          );
        }
      }
      return res.status(500).json({
        msg: "Oops something went wrong",
        code: 500,
      });
    }

    // One failing address must not abort the whole batch. allSettled attaches
    // handlers immediately, so an early rejection is never unhandled while a
    // later send is still in flight.
    const results = await Promise.allSettled(
      acquired.map((sendPlan) =>
        Promise.resolve().then(() => transporter.sendMail(sendPlan.options))
      )
    );

    let noOfMails = 0;
    let userBirthdays = 0;
    let failed = 0;
    let finalizeFailed = 0;

    for (let index = 0; index < results.length; index += 1) {
      const sendPlan = acquired[index];
      const result = results[index];

      if (result.status === "fulfilled") {
        // A sent mail must be recorded as sent. If this write fails the claim
        // intentionally stays `sending` (no retry, no duplicate), but the
        // batch continues with every other task.
        try {
          await markDeliverySent(
            database,
            sendPlan.user,
            sendPlan.localDate,
            sendPlan.kind
          );
          if (sendPlan.kind === "reminder") {
            noOfMails += 1;
          } else {
            userBirthdays += 1;
          }
        } catch (finalizeError: unknown) {
          finalizeFailed += 1;
          console.error(
            `sendEmail: could not record a sent ${sendPlan.kind} delivery`,
            errorName(finalizeError)
          );
        }
        continue;
      }

      failed += 1;
      const code = sanitizeSmtpErrorCode(result.reason);

      try {
        if (code && PRE_DELIVERY_ERROR_CODES.has(code)) {
          // Definite pre-delivery failure: safe to retry on a later run.
          await releaseDelivery(
            database,
            sendPlan.user,
            sendPlan.localDate,
            sendPlan.kind
          );
        } else {
          // Ambiguous (or unknown): SMTP may already have accepted the mail,
          // so keep the claim and never retry it today.
          await markDeliveryFailed(
            database,
            sendPlan.user,
            sendPlan.localDate,
            sendPlan.kind,
            code
          );
        }
      } catch (finalizeError: unknown) {
        finalizeFailed += 1;
        console.error(
          `sendEmail: could not finalize a failed ${sendPlan.kind} delivery`,
          errorName(finalizeError)
        );
      }

      // Deliberately only the kind and sanitized code: no recipient or body.
      console.error(
        `sendEmail: failed to send a ${sendPlan.kind} email`,
        code ?? "unknown error"
      );
    }

    // Partial delivery or an unrecorded final state is a failure for the
    // caller: the workflow fails visibly, while claims still prevent
    // duplicates on the next hourly run.
    if (failed > 0 || finalizeFailed > 0) {
      return res.status(502).json({
        msg: "Some emails failed",
        noOfMails,
        UserBirthdays: userBirthdays,
        failed,
        finalizeFailed,
        skipped,
      });
    }

    return res.status(200).json({
      msg: "Done",
      noOfMails,
      UserBirthdays: userBirthdays,
      failed,
      finalizeFailed,
      skipped,
    });
  } catch (error: unknown) {
    // Log only the error class: messages can contain connection details or
    // recipient data.
    console.error("sendEmail: unexpected failure", errorName(error));
    return res.status(500).json({
      msg: "Oops something went wrong",
      code: 500,
    });
  }
}
