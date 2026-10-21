import { z } from "zod";

const MAX_EVENT_AGE_YEARS = 120;

/** Trimmed, lowercased, valid email address. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address."));

/** Trimmed event name between 1 and 80 characters. */
export const eventNameSchema = z
  .string()
  .trim()
  .min(1, "Event name is required.")
  .max(80, "Event name must be 80 characters or fewer.");

/**
 * Event date: accepts a Date or a date string, must be a real date,
 * cannot be in the future and cannot be older than 120 years.
 */
export const eventDateSchema = z.coerce
  .date({ error: "Please enter a valid date." })
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: "Please enter a valid date.",
  })
  .refine((date) => date.getTime() <= Date.now(), {
    message: "Event date cannot be in the future.",
  })
  .refine(
    (date) => {
      const oldest = new Date();
      oldest.setFullYear(oldest.getFullYear() - MAX_EVENT_AGE_YEARS);
      return date.getTime() >= oldest.getTime();
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
  id: idSchema,
  name: eventNameSchema,
  date: eventDateSchema,
  color: colorSchema,
});

export const deleteEventSchema = z.object({
  id: idSchema,
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
