import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import moment from "moment";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import AddBirthdayModal from "../components/Modal";
import Calender from "../components/Calender";
import Drawer from "../components/drawer";
import TopBar from "../components/TopBar";
import Loading from "../components/layout/loading";
import { Skeleton } from "../components/ui/skeleton";
import type {
  CalendarView,
  event,
  NewBirthday,
} from "../components/types";
import {
  addEvent as AddEvent,
  deleteEvent as DeleteEvent,
  editEvent as EditEvent,
  getEvents,
} from "../lib/helperFunctions";

const Dashboard: NextPage = () => {
  const [events, setEvents] = useState<event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<event | null>(null);
  const [view, setView] = useState<CalendarView>("agenda");
  const [currentYear, setCurrentYear] = useState(() => moment());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Unauthenticated visitors go straight to the login page instead of
  // landing on a dead-end message.
  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    getEvents({
      setEvents: (nextEvents) => {
        if (!cancelled) setEvents(nextEvents);
      },
    })
      .catch((error: unknown) => {
        console.error(error);
        toast.error("Couldn't load your birthdays", {
          description: "Please refresh the page to try again.",
        });
      })
      .finally(() => {
        if (!cancelled) setIsConnected(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleAddEvent(nextEvent: NewBirthday) {
    const email = session?.user?.email;

    if (!email) {
      toast.error("You need to be signed in", {
        description: "Sign in again and your birthday will be saved.",
      });
      throw new Error("No authenticated session.");
    }

    setIsLoading(true);

    try {
      const created = await AddEvent({
        name: nextEvent.name,
        date: nextEvent.date,
        color: nextEvent.color,
        email,
      });

      setEvents((previous) => [...previous, created]);

      toast.success("Birthday added 🎉", {
        description: `We will remind you to wish ${created.name} on ${moment(
          created.date
        ).format("MMM Do")} every year.`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't add that birthday. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditEvent(updatedEvent: event) {
    if (!session?.user?.email) {
      toast.error("You need to be signed in", {
        description: "Sign in again and try once more.",
      });
      throw new Error("No authenticated session.");
    }

    setIsLoading(true);

    try {
      const nextEvents = await EditEvent(updatedEvent, events);
      setEvents(nextEvents);
      setSelectedEvent((previous) =>
        previous && previous._id === updatedEvent._id
          ? updatedEvent
          : previous
      );

      toast.success("Birthday updated", {
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't update that birthday. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!session?.user?.email) {
      toast.error("You need to be signed in", {
        description: "Sign in again and try once more.",
      });
      throw new Error("No authenticated session.");
    }

    setIsLoading(true);

    try {
      const nextEvents = await DeleteEvent(id, events);
      setEvents(nextEvents);
      setSelectedEvent((previous) =>
        previous && previous._id === id ? null : previous
      );
      setIsDrawerOpen(false);

      toast.success("Birthday deleted", {
        description: "The birthday was removed successfully.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong!", {
        description: "We couldn't delete that birthday. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectEvent(id: string) {
    const selected = events.find((item) => item._id === id);
    if (!selected) return;

    setSelectedEvent(selected);
    setIsDrawerOpen(true);
  }

  if (status === "loading") {
    return (
      <>
        <Head>
          <title>dashboard | Slax </title>
        </Head>
        <DashboardSkeleton />
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>dashboard | Slax </title>
        </Head>
        <div
          className="flex min-h-[calc(100dvh-4rem)] animate-in items-center justify-center gap-3 px-6 text-muted-foreground duration-300 fade-in motion-reduce:animate-none"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="size-5 animate-spin text-brand"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">Taking you to sign in…</p>
        </div>
      </>
    );
  }

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>dashboard | Slax </title>
        </Head>
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>dashboard | Slax </title>
      </Head>

      <div className="min-h-[calc(100dvh-4rem)] w-full bg-background">
        <TopBar
          view={view}
          setView={setView}
          currentYear={currentYear}
          onOpen={() => setIsAddOpen(true)}
          setCurrentYear={setCurrentYear}
        />

        <main className="mx-auto w-full max-w-6xl animate-in px-3 pt-5 pb-10 fade-in duration-300 motion-reduce:animate-none sm:px-6 sm:pt-6">
          <Calender
            onClickAddBirthday={() => setIsAddOpen(true)}
            view={view}
            onClickEvent={handleSelectEvent}
            year={currentYear}
            events={events}
          />
        </main>
      </div>

      <AddBirthdayModal
        PushEvent={handleAddEvent}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
      <Drawer
        event={selectedEvent}
        onClose={() => setIsDrawerOpen(false)}
        isOpen={isDrawerOpen}
        onDelete={handleDeleteEvent}
        onSave={handleEditEvent}
      />
      <Loading isOpen={isLoading} />
    </>
  );
};

function DashboardSkeleton() {
  return (
    <div
      className="min-h-[calc(100dvh-4rem)] w-full bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading your birthdays…</span>
      <div className="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>

        <div className="space-y-4 pt-2">
          <Skeleton className="h-8 w-36 rounded-lg" />
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-6 w-12 rounded-md" />
              <Skeleton className="h-16 flex-1 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
