import moment from "moment";
import { Badge } from "./ui/badge";
import Card from "./Card";
import type { event } from "./types";

type MonthGroup = {
  month: number;
  items: event[];
};

export default function Agenda({
  events,
  year,
  onClickEvent,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: (id: string) => void;
}) {
  const groups: MonthGroup[] = [];
  const groupByMonth = new Map<number, event[]>();

  for (const item of events) {
    const month = item.date.month();
    const existing = groupByMonth.get(month);
    if (existing) {
      existing.push(item);
    } else {
      const items = [item];
      groupByMonth.set(month, items);
      groups.push({ month, items });
    }
  }

  groups.sort((a, b) => a.month - b.month);

  return (
    <div className="w-full space-y-8 pb-6">
      {groups.map(({ month, items }) => (
        <section key={month} aria-labelledby={`agenda-month-${month}`}>
          <div className="mb-3 flex items-center gap-3 px-1">
            <h2
              id={`agenda-month-${month}`}
              className="font-display text-2xl leading-none font-semibold text-foreground sm:text-3xl"
            >
              {moment.months()[month]}{" "}
              <span className="text-xl font-medium text-muted-foreground sm:text-2xl">
                {year.format("YYYY")}
              </span>
            </h2>
            <span
              aria-hidden="true"
              className="h-px min-w-4 flex-1 bg-border"
            />
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              {items.length}
            </Badge>
          </div>

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
        </section>
      ))}
    </div>
  );
}
