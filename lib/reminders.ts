import moment from "moment-timezone";
import { REMINDER_TIMEZONE, toDateKey } from "./dateOnly";

export { REMINDER_TIMEZONE };

/** Number of calendar days after today included in the "upcoming" heads-up. */
export const UPCOMING_WINDOW_DAYS = 3;

/** Minimal shape the pure bucket builder needs from a stored reminder. */
export interface ReminderEventInput {
  name: string;
  /**
   * Stored birthday: a `YYYY-MM-DD` date key, or a legacy BSON Date. The year
   * is irrelevant; only month/day are matched.
   */
  date: Date | string;
  /** Address the reminder is sent to. */
  user: string;
  /** True when the event is the account owner's own birthday. */
  isUser?: boolean;
}

export interface ReminderMail {
  user: string;
  /** Lines such as "Ada." */
  today: string[];
  /** Lines such as "Ada's birthday on 1st of Nov." */
  upcoming: string[];
}

export interface SelfBirthdayMail {
  user: string;
  userName: string;
}

export interface ReminderBuckets {
  /** One entry per user that has a today and/or upcoming birthday. */
  reminders: ReminderMail[];
  /** One entry per user whose own birthday is today. */
  selfBirthdays: SelfBirthdayMail[];
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

/**
 * Basic recipient sanity check for values stored in the database.
 *
 * Rejects whitespace/control characters (including CR/LF) and angle brackets
 * so a stored address can never smuggle extra mail headers or a display name
 * into the `To:` field. Requires exactly one `@` with a non-empty local part
 * and domain. This intentionally does not try to be a full RFC 5322 parser.
 */
export function isSafeEmailRecipient(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.includes("<") || value.includes(">")) return false;
  if (!/^[^\s@<>]+@[^\s@<>]+$/.test(value)) return false;
  return value.indexOf("@") === value.lastIndexOf("@");
}

/**
 * Strip control characters (including CR/LF), trim, and cap the length of a
 * value before it is interpolated into a mail header such as `Subject:`.
 */
export function sanitizeHeaderValue(value: string, maxLength = 80): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/**
 * The month/day a stored birthday is observed on in a given year.
 *
 * The key is already a civil date (`YYYY-MM-DD`), either stored directly or
 * derived from a legacy BSON Date in `REMINDER_TIMEZONE`, so only the month and
 * day are used here.
 *
 * Locked policy: a Feb 29 birthday is observed on Feb 28 in non-leap years.
 * This keeps the reminder from silently disappearing for three years out of
 * four, and the same effective date is used for both ordinary reminders and
 * the account owner's own happy-birthday email.
 */
function effectiveMonthDay(dateKey: string, isLeapYear: boolean): string {
  const month = Number(dateKey.slice(5, 7));
  let day = Number(dateKey.slice(8, 10));
  if (month === 2 && day === 29 && !isLeapYear) {
    day = 28;
  }
  return `${twoDigits(month)}-${twoDigits(day)}`;
}

/**
 * Pure reminder matching. No database and no mail access, so it is trivially
 * testable with a fixed `now`.
 *
 * Matching is done on "MM-DD" keys built from each stored date's civil date
 * (`toDateKey`), while "today" is the current day in `REMINDER_TIMEZONE`. That
 * makes month and year rollover (Oct 30 -> Nov 1, Dec 30 -> Jan 1) fall out
 * naturally. Stored dates are normalised through `effectiveMonthDay` so the
 * Feb 29 policy above applies uniformly.
 *
 * Important: a stored `YYYY-MM-DD` string is a civil date and is never shifted
 * by a timezone conversion. Only legacy BSON `Date` values are treated as
 * instants and converted to their IST calendar date.
 */
export function buildReminderBuckets(
  events: ReminderEventInput[],
  now: moment.MomentInput
): ReminderBuckets {
  const today = moment.tz(now, REMINDER_TIMEZONE).startOf("day");
  const isLeapYear = today.isLeapYear();

  const offsetsByKey = new Map<string, number>();
  for (let offset = 0; offset <= UPCOMING_WINDOW_DAYS; offset += 1) {
    offsetsByKey.set(
      today.clone().add(offset, "days").format("MM-DD"),
      offset
    );
  }

  interface PendingBucket {
    user: string;
    today: string[];
    upcoming: { name: string; offset: number }[];
  }

  const pending = new Map<string, PendingBucket>();
  const selfBirthdays = new Map<string, string>();

  for (const event of events) {
    if (!event) continue;
    if (typeof event.name !== "string" || event.name.length === 0) continue;
    // Malformed stored addresses are skipped instead of being handed to the
    // mailer, where CR/LF or angle brackets could alter headers.
    if (!isSafeEmailRecipient(event.user)) continue;

    const dateKey = toDateKey(event.date);
    if (dateKey === null) continue;

    const offset = offsetsByKey.get(effectiveMonthDay(dateKey, isLeapYear));
    if (offset === undefined) continue;

    if (event.isUser === true) {
      // The owner's own birthday is never listed; it only triggers the
      // happy-birthday email, and only when it actually falls today.
      if (offset === 0 && !selfBirthdays.has(event.user)) {
        selfBirthdays.set(event.user, event.name);
      }
      continue;
    }

    let bucket = pending.get(event.user);
    if (!bucket) {
      bucket = { user: event.user, today: [], upcoming: [] };
      pending.set(event.user, bucket);
    }

    if (offset === 0) {
      bucket.today.push(event.name);
    } else {
      bucket.upcoming.push({ name: event.name, offset });
    }
  }

  const reminders: ReminderMail[] = [];
  for (const bucket of pending.values()) {
    if (bucket.today.length === 0 && bucket.upcoming.length === 0) continue;

    reminders.push({
      user: bucket.user,
      today: [...bucket.today].sort(compareNames).map((name) => `${name}.`),
      upcoming: [...bucket.upcoming]
        .sort((a, b) => a.offset - b.offset || compareNames(a.name, b.name))
        .map(({ name, offset }) => {
          // Use the computed occurrence so the displayed month/day (and year
          // for rollover) is the next actual birthday, not the stored year.
          const occurrence = today.clone().add(offset, "days");
          return `${name}'s birthday on ${occurrence.format("Do [of] MMM")}.`;
        }),
    });
  }
  reminders.sort((a, b) => a.user.localeCompare(b.user, "en"));

  return {
    reminders,
    selfBirthdays: [...selfBirthdays.entries()]
      .map(([user, userName]) => ({ user, userName }))
      .sort((a, b) => a.user.localeCompare(b.user, "en")),
  };
}
