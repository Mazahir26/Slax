import type { CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import moment from "moment";

/** Pick black or white ink for a pastel birthday color. */
function getContrast(hexColor: string) {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#111111";

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const brightness = Math.round(
    (red * 299 + green * 587 + blue * 114) / 1000
  );

  return brightness > 125 ? "#111111" : "#ffffff";
}

export default function Card({
  color,
  name,
  date,
  newDate,
  currentDate,
  id,
  onClick,
}: {
  color: string;
  name: string;
  date: moment.Moment;
  currentDate: moment.Moment;
  newDate: boolean;
  id: string;
  onClick: (id: string) => void;
}) {
  const age = Math.abs(date.diff(currentDate, "years"));
  const isToday = moment(date)
    .year(currentDate.year())
    .isSame(moment(), "day");

  const accentStyle = {
    "--card-color": color,
    "--card-ink": getContrast(color),
  } as CSSProperties;

  return (
    <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
      <div className="flex w-12 shrink-0 flex-col items-center pt-1 text-center sm:w-14">
        {newDate ? (
          <>
            <span className="font-display text-xl leading-none font-semibold text-foreground sm:text-2xl">
              {date.format("Do")}
            </span>
            {isToday ? (
              <span className="mt-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand-foreground uppercase">
                Today
              </span>
            ) : null}
          </>
        ) : (
          <span aria-hidden="true" className="h-6" />
        )}
      </div>

      <button
        type="button"
        onClick={() => onClick(id)}
        style={accentStyle}
        className="group relative flex min-h-16 w-full min-w-0 flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-black/5 p-3 text-left shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.99] sm:p-4 dark:border-border dark:bg-card"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[var(--card-color)] transition-opacity duration-200 group-hover:opacity-90 dark:hidden"
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 hidden w-1 rounded-r-full bg-[var(--card-color)] dark:block"
        />

        <div className="relative z-10 min-w-0 flex-1">
          <p className="truncate text-base font-bold text-[color:var(--card-ink)] sm:text-lg dark:text-card-foreground">
            {name}&apos;s Birthday
          </p>
          <p className="mt-0.5 text-sm text-[color:var(--card-ink)] opacity-80 dark:text-muted-foreground">
            {age} years old
          </p>
        </div>

        <ChevronRight
          aria-hidden="true"
          className="relative z-10 size-4 shrink-0 text-[color:var(--card-ink)] opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-muted-foreground"
        />
      </button>
    </div>
  );
}
