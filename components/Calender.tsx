import { useMemo } from "react";
import { Cake, Plus } from "lucide-react";
import moment from "moment";

import { Button } from "./ui/button";
import Agenda from "./Agenda";
import Month from "./Monthly";
import type { CalendarView, event } from "./types";

/** Sort by calendar month/day, ignoring the birth year. */
function sortByBirthday(a: event, b: event) {
  const monthDifference = a.date.month() - b.date.month();
  if (monthDifference !== 0) return monthDifference;

  const dayDifference = a.date.date() - b.date.date();
  if (dayDifference !== 0) return dayDifference;

  return a.name.localeCompare(b.name);
}

export default function Calender({
  events,
  year,
  onClickEvent,
  view,
  onClickAddBirthday,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: (id: string) => void;
  view: CalendarView;
  onClickAddBirthday: () => void;
}) {
  const sortedEvents = useMemo(
    () => [...events].sort(sortByBirthday),
    [events]
  );

  if (sortedEvents.length === 0) {
    return (
      <div className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center sm:p-10">
        <span className="bg-playful-gradient flex size-16 items-center justify-center rounded-2xl text-white shadow-lg">
          <Cake className="size-8" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
            Looks like you haven&apos;t added a birthday yet 🤔
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
            Add someone special and we&apos;ll help you remember their big day,
            year after year.
          </p>
        </div>
        <Button
          type="button"
          onClick={onClickAddBirthday}
          className="h-11 rounded-full bg-brand px-5 text-brand-foreground shadow-sm hover:bg-brand/90"
        >
          <Plus aria-hidden="true" />
          Add your first birthday
        </Button>
      </div>
    );
  }

  if (view === "agenda") {
    return (
      <Agenda events={sortedEvents} onClickEvent={onClickEvent} year={year} />
    );
  }

  return (
    <Month
      events={sortedEvents}
      onClickEvent={onClickEvent}
      year={year}
      onClickAddBirthday={onClickAddBirthday}
    />
  );
}
