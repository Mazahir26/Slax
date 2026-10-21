import { Plus } from "lucide-react";
import moment from "moment";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Card from "./Card";
import type { event } from "./types";

export default function Month({
  events,
  year,
  onClickEvent,
  onClickAddBirthday,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: (id: string) => void;
  onClickAddBirthday: () => void;
}) {
  return (
    <div className="w-full space-y-8 pb-6">
      {moment.months().map((month, monthIndex) => {
        const items = events.filter(
          (item) => item.date.month() === monthIndex
        );

        return (
          <section
            key={`${month}-${monthIndex}`}
            aria-labelledby={`month-${monthIndex}`}
          >
            <div className="mb-3 flex items-center gap-3 px-1">
              <h2
                id={`month-${monthIndex}`}
                className="font-display text-2xl leading-none font-semibold text-foreground sm:text-3xl"
              >
                {month}{" "}
                <span className="text-xl font-medium text-muted-foreground sm:text-2xl">
                  {year.format("YYYY")}
                </span>
              </h2>
              <span
                aria-hidden="true"
                className="h-px min-w-4 flex-1 bg-border"
              />
              {items.length > 0 ? (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {items.length}
                </Badge>
              ) : null}
            </div>

            {items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={item._id} className="flex">
                    <Card
                      onClick={onClickEvent}
                      id={item._id}
                      currentDate={year}
                      name={item.name}
                      color={item.color}
                      date={item.date}
                      newDate={
                        index === 0 ||
                        item.date.format("DD MM") !==
                          items[index - 1].date.format("DD MM")
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-3 sm:p-4">
                <p className="min-w-0 flex-1 text-sm font-medium text-muted-foreground sm:text-base">
                  No birthdays this month 🙁
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClickAddBirthday}
                  className="h-11 shrink-0 rounded-full px-4"
                >
                  <Plus aria-hidden="true" />
                  Add One
                </Button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
