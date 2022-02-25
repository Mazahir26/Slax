import moment from "moment";
import { InsertOneResult } from "mongodb";
import { Session } from "next-auth";
import { NextRouter } from "next/router";
import { event, rawEvent } from "../components/types";

export async function getEvents({
  status,
  setEvents,
  router,
  setIsConnected,
}: {
  status: "authenticated" | "loading" | "unauthenticated";
  setEvents: Function;
  router: NextRouter;
  setIsConnected: Function;
}) {
  if (status == "authenticated") {
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

      const body: event[] = await response.json();
      const temp = body.map((item: event) => {
        return {
          name: item.name,
          date: moment(item.date),
          _id: item._id,
          user: item.user,
          color: item.color,
        };
      });
      setEvents(temp);
    } catch (error) {
      router.push("/error?error=ServerError");
      console.log(error);
    } finally {
      setIsConnected(true);
    }
  }
}

async function addEvent(
  event: {
    name: string;
    date: moment.Moment;
    color: string;
  },
  setLoading: Function,
  session: Session,
  setEvents: Function,
  toast: Function,
  events: event[],
  stopLoading: Function
) {
  if (session.user?.email) {
    try {
      setLoading();
      const response = await fetch("/api/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: event.name,
          date: event.date.toISOString(),
          color: event.color,
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
          user: session.user.email,
          color: event.color,
        };

        setEvents([...events, insertData]);
      } else {
        throw Error("Not Acknowledged");
      }
      toast({
        position: "bottom-left",
        title: "Birthday Added. 🎉",
        status: "success",
        description: `We will remind you to wish ${event.name} on ${moment(
          event.date
        ).format("MMM Do")} every year`,
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        position: "bottom-left",
        title: "Oops something went wrong!",
        status: "error",
        description: `Try again later..:(`,
        duration: 5000,
        isClosable: true,
      });
    } finally {
      stopLoading();
    }
  }
}
