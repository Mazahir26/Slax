import moment from "moment";
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { event, rawEvent } from "../components/types";

export async function getEvents({ setEvents }: { setEvents: Function }) {
  try {
    const response = await fetch("/api/getEvents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      throw Error(response.status.toString());
    }

    const body: {
      result: event[];
      isNewUser: boolean;
    } = await response.json();
    const temp = body.result.map((item: event) => {
      return {
        name: item.name,
        date: moment(item.date),
        _id: item._id,
        user: item.user,
        color: item.color,
      };
    });
    setEvents(temp);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function addEvent(event: {
  name: string;
  date: moment.Moment;
  color: string;
  email: string;
  isUser?: boolean;
}) {
  try {
    const response = await fetch("/api/createEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.name,
        date: event.date.toISOString(),
        color: event.color,
        isUser: event.isUser,
      }),
    });
    if (response.status !== 201) {
      throw Error(response.status.toString());
    }
    const body: InsertOneResult<rawEvent> = await response.json();

    if (body.acknowledged) {
      const insertData: event = {
        _id: body.insertedId.toString(),
        date: moment(event.date),
        name: event.name,
        user: event.email,
        color: event.color,
      };

      return insertData;
    } else {
      throw Error("Not Acknowledged");
    }
  } catch (error: any) {
    throw Error(error);
  }
}

export async function deleteEvent(id: string, events: event[]) {
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
    if (response.status !== 200) {
      throw Error(response.status.toString());
    }

    const body: DeleteResult = await response.json();
    if (body.acknowledged) {
      let temp = events;
      const filtered = temp.filter((value) => value._id !== id);
      return filtered;
    } else {
      throw Error("Not Acknowledged");
    }
  } catch (error: any) {
    throw Error(error);
  }
}

export async function editEvent(event: event, events: event[]) {
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
        date: event.date.toISOString(),
      }),
    });

    if (response.status !== 200) {
      throw Error(response.status.toString());
    }

    const body: UpdateResult = await response.json();
    if (body.acknowledged) {
      let temp = [...events];
      temp.map((x) => {
        if (x._id === event._id) {
          x.color = event.color;
          x.date = event.date;
          x.name = event.name;
        }
      });
      return temp;
    } else {
      throw Error("Not Acknowledged");
    }
  } catch (error: any) {
    throw Error(error);
  }
}

export async function getUser() {
  try {
    const response = await fetch("/api/newuser", {
      method: "GET",
    });
    if (response.status !== 200) {
      throw Error(response.status.toString());
    }
    const data: {
      email: string;
      isNew: boolean;
    } = await response.json();

    return data;
  } catch (error: any) {
    throw Error(error);
  }
}
