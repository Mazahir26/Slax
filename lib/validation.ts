import { z } from "zod";

const MAX_EVENT_AGE_YEARS = 120;

/** Trimmed, lowercased, valid email address. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address."));

/** Matches ASCII control characters (including CR/LF) and DEL. */
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

/** Trimmed event name between 1 and 80 characters without control characters. */
export const eventNameSchema = z
  .string()
  .trim()
  .min(1, "Event name is required.")
  .max(80, "Event name must be 80 characters or fewer.")
  .refine((value) => !CONTROL_CHARACTER_PATTERN.test(value), {
    message: "Event name must not contain control characters.",
  });

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[Zz]|[+-]\d{2}:?\d{2})?$/;

/** True when the Y/M/D components survive a Date round-trip (rejects Feb 31, month 13, day 0, ...). */
function isRealCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Parse a YYYY-MM-DD string to local midnight, or null when it is not a real calendar date. */
function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isRealCalendarDate(year, month, day)) return null;

  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Parse a date string to a Date, or null when it is not a valid date. */
function parseEventDateString(value: string): Date | null {
  if (DATE_ONLY_PATTERN.test(value)) return parseDateOnly(value);

  const match = ISO_DATETIME_PATTERN.exec(value);
  if (!match) return null;

  // `new Date("2025-02-31T10:00:00Z")` normalizes instead of failing,
  // so validate the calendar part before trusting the parsed timestamp.
  if (!isRealCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Event date: accepts a Date or a YYYY-MM-DD / ISO datetime string, must be a
 * real date, cannot be in the future and cannot be older than 120 years.
 */
export const eventDateSchema = z
  .unknown()
  .transform((value, ctx): Date => {
    if (value instanceof Date) {
      if (!Number.isNaN(value.getTime())) return value;
      ctx.addIssue({ code: "custom", message: "Please enter a valid date." });
      return z.NEVER;
    }

    const parsed =
      typeof value === "string" && value.trim().length > 0
        ? parseEventDateString(value.trim())
        : null;
    if (parsed === null) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid date." });
      return z.NEVER;
    }

    return parsed;
  })
  .refine((date) => date.getTime() <= Date.now(), {
    message: "Event date cannot be in the future.",
  })
  .refine(
    (date) => {
      const oldest = new Date();
      oldest.setFullYear(oldest.getFullYear() - MAX_EVENT_AGE_YEARS);
      return startOfDay(date).getTime() >= startOfDay(oldest).getTime();
    },
    {
      message: `Event date cannot be more than ${MAX_EVENT_AGE_YEARS} years ago.`,
    },
  );

/** Hex color in #RRGGBB form. */
export const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #4c9bf5.");

/** Mongo ObjectId string. */
export const idSchema = z
  .string()
  .trim()
  .min(1, "An id is required.")
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id.");

export const createEventSchema = z.object({
  name: eventNameSchema,
  date: eventDateSchema,
  color: colorSchema,
  isUser: z.boolean().optional(),
});

export const editEventSchema = z.object({
  _id: idSchema,
  name: eventNameSchema,
  date: eventDateSchema,
  color: colorSchema,
});

export const deleteEventSchema = z.object({
  _id: idSchema,
});

export const onboardingSchema = z.object({
  name: eventNameSchema,
  date: eventDateSchema,
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EditEventInput = z.infer<typeof editEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type EventName = z.infer<typeof eventNameSchema>;
export type EventDate = z.infer<typeof eventDateSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Color = z.infer<typeof colorSchema>;
