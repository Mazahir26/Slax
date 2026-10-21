/**
 * Birthdays are civil dates, not instants.
 *
 * A birthday is the calendar day the user picked, so it must never depend on
 * the browser or server timezone. New records store a `YYYY-MM-DD` date key.
 * Legacy records store BSON `Date`s; those are interpreted as instants and
 * converted to the calendar date observed in `REMINDER_TIMEZONE`.
 */

/** Locked decision: every reminder calculation happens in India Standard Time. */
export const REMINDER_TIMEZONE = "Asia/Kolkata";

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
/** Leading calendar part of an ISO datetime (used to reject Feb 31, day 0, ...). */
const ISO_DATE_PART_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ]|$)/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isRealCalendarDate(
  year: number,
  month: number,
  day: number
): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const maxDay =
    month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
  return day <= maxDay;
}

/**
 * Strict `YYYY-MM-DD` date-key guard. Rejects impossible calendar dates such
 * as `2025-02-31`, month 13 and day 0 instead of letting `Date` normalise them.
 */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;

  return isRealCalendarDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3])
  );
}

/** Formatter is reused because building one per row is comparatively costly. */
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: REMINDER_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date of an instant in `REMINDER_TIMEZONE`, or null when invalid. */
function instantToDateKey(date: Date): string | null {
  if (Number.isNaN(date.getTime())) return null;

  let year = "";
  let month = "";
  let day = "";
  for (const part of DATE_KEY_FORMATTER.formatToParts(date)) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
  }

  const key = `${year}-${month}-${day}`;
  return isDateKey(key) ? key : null;
}

/**
 * Convert a stored value to a `YYYY-MM-DD` date key.
 *
 * - Date-only strings pass through unchanged: they are already civil dates and
 *   must not be shifted by a timezone conversion.
 * - `Date` objects and ISO datetime strings are instants, so they are rendered
 *   in `REMINDER_TIMEZONE`. This is the documented legacy interpretation: a
 *   BSON Date of `2000-10-20T15:00:00Z` maps to `2000-10-20` in IST.
 * - Anything invalid (Feb 31, garbage, invalid Date) returns null.
 */
export function toDateKey(value: Date | string): string | null {
  if (value instanceof Date) {
    return instantToDateKey(value);
  }

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  // Date-only strings are civil dates: validate strictly and pass through.
  if (DATE_KEY_PATTERN.test(trimmed)) {
    return isDateKey(trimmed) ? trimmed : null;
  }

  // `new Date("2025-02-31T10:00:00Z")` normalises instead of failing, so the
  // calendar part is validated before trusting the parsed instant.
  const datePart = ISO_DATE_PART_PATTERN.exec(trimmed);
  if (
    datePart &&
    !isRealCalendarDate(
      Number(datePart[1]),
      Number(datePart[2]),
      Number(datePart[3])
    )
  ) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return instantToDateKey(parsed);
}

/** Today's calendar date in `REMINDER_TIMEZONE`. */
export function todayDateKey(now: Date = new Date()): string {
  const key = instantToDateKey(now);
  if (key === null) {
    throw new RangeError("todayDateKey received an invalid Date.");
  }
  return key;
}

/**
 * Shift a date key by whole years.
 *
 * Locked policy: Feb 29 birthdays are observed on Feb 28 when the target year
 * is not a leap year, matching the reminder behaviour.
 */
export function shiftDateKeyYears(key: string, years: number): string {
  if (!isDateKey(key)) {
    throw new RangeError(`Invalid date key: ${key}`);
  }
  if (!Number.isInteger(years)) {
    throw new RangeError(`Years must be an integer: ${years}`);
  }

  const targetYear = Number(key.slice(0, 4)) + years;
  if (targetYear < 0 || targetYear > 9999) {
    throw new RangeError(`Shifted year is out of range: ${targetYear}`);
  }

  const month = key.slice(5, 7);
  let day = Number(key.slice(8, 10));
  if (month === "02" && day === 29 && !isLeapYear(targetYear)) {
    day = 28;
  }

  return `${String(targetYear).padStart(4, "0")}-${month}-${String(
    day
  ).padStart(2, "0")}`;
}

/** Lexicographic comparison that is chronological for `YYYY-MM-DD` keys. */
export function compareDateKeys(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
