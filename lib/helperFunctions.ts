import moment from "moment";
import type { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import type { event, eventData, rawEvent } from "../components/types";

type NewEventInput = {
  name: string;
  date: moment.Moment;
  color: string;
  email: string;
  isUser?: boolean;
};

/** Normalize anything thrown by the fetch layer into a readable Error. */
function toError(error: unknown, fallback = "Something went wrong."): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string" && error.trim().length > 0) {
    return new Error(error);
  }
  return new Error(fallback);
}

/**
 * Throw a descriptive error when the API answers with an unexpected status.
 * The response body is only read on the failure path, so callers can still
 * consume it after a successful request.
 */
async function assertStatus(response: Response, expected: number) {
  if (response.status === expected) return;

  let detail = "";
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      detail = body.error;
    }
  } catch {
    // The response was not JSON; the status code is enough context.
  }

  throw new Error(detail || `Request failed with status ${response.status}.`);
}

export async function getEvents({
  setEvents,
}: {
  setEvents: (events: event[]) => void;
}) {
  try {
    const response = await fetch("/api/getEvents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    await assertStatus(response, 200);

    const body = (await response.json()) as {
      result?: eventData[];
    };

    if (!body || !Array.isArray(body.result)) {
      throw new Error("The server returned an unexpected response.");
    }

    const events: event[] = body.result.map((item) => ({
      name: item.name,
      date: moment(item.date),
      _id: item._id,
      user: item.user,
      color: item.color,
    }));

    setEvents(events);
  } catch (error) {
    throw toError(error, "Could not load your birthdays.");
  }
}

export async function addEvent(event: NewEventInput): Promise<event> {
  try {
    const response = await fetch("/api/createEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.name,
        // Birthdays are civil dates: send the user's selected calendar day,
        // never a browser-local midnight instant.
        date: event.date.format("YYYY-MM-DD"),
        color: event.color,
        isUser: event.isUser,
      }),
    });
    await assertStatus(response, 201);

    const body = (await response.json()) as InsertOneResult<rawEvent>;
    if (!body.acknowledged) {
      throw new Error("The server did not acknowledge the new birthday.");
    }

    return {
      _id: body.insertedId.toString(),
      date: moment(event.date),
      name: event.name,
      user: event.email,
      color: event.color,
    };
  } catch (error) {
    throw toError(error, "Could not add this birthday.");
  }
}

export async function deleteEvent(
  id: string,
  events: event[]
): Promise<event[]> {
  try {
    const response = await fetch("/api/deleteEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
      }),
    });
    await assertStatus(response, 200);

    const body = (await response.json()) as DeleteResult;
    if (!body.acknowledged) {
      throw new Error("The server did not acknowledge the deletion.");
    }

    return events.filter((value) => value._id !== id);
  } catch (error) {
    throw toError(error, "Could not delete this birthday.");
  }
}

export async function editEvent(
  event: event,
  events: event[]
): Promise<event[]> {
  try {
    const response = await fetch("/api/editEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: event._id,
        name: event.name,
        color: event.color,
        date: event.date.format("YYYY-MM-DD"),
      }),
    });
    await assertStatus(response, 200);

    const body = (await response.json()) as UpdateResult;
    if (!body.acknowledged) {
      throw new Error("The server did not acknowledge the update.");
    }

    // Return a new array with a new event object so callers never see a
    // silently mutated array/object.
    return events.map((item) =>
      item._id === event._id
        ? {
            ...item,
            name: event.name,
            color: event.color,
            date: moment(event.date),
          }
        : item
    );
  } catch (error) {
    throw toError(error, "Could not update this birthday.");
  }
}

export async function getUser() {
  try {
    const response = await fetch("/api/newUser", {
      method: "GET",
    });
    await assertStatus(response, 200);

    const data = (await response.json()) as {
      email: string;
      isNew: boolean;
    };

    return data;
  } catch (error) {
    throw toError(error, "Could not load your account.");
  }
}
