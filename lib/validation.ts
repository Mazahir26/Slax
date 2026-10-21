import { z } from "zod";
import {
  isDateKey,
  shiftDateKeyYears,
  toDateKey,
  todayDateKey,
} from "./dateOnly";

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

const ISO_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[Zz]|[+-]\d{2}:?\d{2})?$/;

/**
 * Event date: accepts a Date or a YYYY-MM-DD / ISO datetime string, but always
 * outputs a `YYYY-MM-DD` date key. Date-only strings are civil dates and are
 * validated strictly; Date objects and ISO datetimes are instants and are
 * converted to the calendar date in `REMINDER_TIMEZONE`. The result cannot be
 * in the future and cannot be older than 120 years.
 */
export const eventDateSchema = z
  .unknown()
  .transform((value, ctx): string => {
    let key: string | null = null;

    if (value instanceof Date) {
      key = toDateKey(value);
    } else if (typeof value === "string") {
      const trimmed = value.trim();
      if (isDateKey(trimmed)) {
        key = trimmed;
      } else if (ISO_DATETIME_PATTERN.test(trimmed)) {
        key = toDateKey(trimmed);
      }
    }

    if (key === null) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid date." });
      return z.NEVER;
    }

    return key;
  })
  .refine((value) => value <= todayDateKey(), {
    message: "Event date cannot be in the future.",
  })
  .refine(
    (value) =>
      value >= shiftDateKeyYears(todayDateKey(), -MAX_EVENT_AGE_YEARS),
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
