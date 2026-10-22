import moment from "moment";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  List,
  Plus,
} from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import type { CalendarView } from "./types";

const MAX_YEARS_AHEAD = 50;

export default function TopBar({
  currentYear,
  setCurrentYear,
  onOpen,
  setView,
  view,
}: {
  currentYear: moment.Moment;
  setCurrentYear: (year: moment.Moment) => void;
  onOpen: () => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
}) {
  const thisYear = moment().year();
  const canGoBack = currentYear.year() > thisYear;
  const canGoForward =
    moment(currentYear).diff(moment(), "years") < MAX_YEARS_AHEAD;
  const isViewingCurrentYear = currentYear.year() === thisYear;

  const changeYear = (amount: number) => {
    setCurrentYear(currentYear.clone().add(amount, "year"));
  };

  const changeView = (nextView: string) => {
    if (nextView === "agenda" || nextView === "month") {
      setView(nextView);
    }
  };

  return (
    <header className="sticky top-16 z-30 mx-auto w-full max-w-6xl px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/90 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:gap-3 sm:p-3">
        <div className="flex min-w-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Previous year"
            disabled={!canGoBack}
            onClick={() => changeYear(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>

          <h1
            aria-live="polite"
            className="font-display min-w-14 text-center text-2xl font-semibold tabular-nums text-foreground sm:min-w-16 sm:text-3xl"
          >
            {currentYear.format("YYYY")}
          </h1>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Next year"
            disabled={!canGoForward}
            onClick={() => changeYear(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>

          {!isViewingCurrentYear ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentYear(moment())}
              aria-label="Return to the current year"
              className="ml-0.5 h-11 rounded-full px-3 text-xs sm:ml-1 sm:px-4 sm:text-sm"
            >
              <CalendarDays aria-hidden="true" />
              Today
            </Button>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            onClick={onOpen}
            className="hidden h-11 rounded-full bg-brand px-4 text-brand-foreground shadow-sm hover:bg-brand/90 sm:inline-flex"
          >
            <Plus aria-hidden="true" />
            Add Birthday
          </Button>

          <Button
            type="button"
            size="icon"
            onClick={onOpen}
            aria-label="Add birthday"
            className="size-11 rounded-full bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 sm:hidden"
          >
            <Plus aria-hidden="true" />
          </Button>

          <Tabs
            value={view}
            onValueChange={changeView}
            className="hidden md:block"
          >
            <TabsList
              aria-label="Calendar view"
              className="h-auto! rounded-full bg-muted p-1"
            >
              <TabsTrigger
                value="agenda"
                className="h-11 gap-1.5 rounded-full px-4 transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <List aria-hidden="true" />
                Agenda
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="h-11 gap-1.5 rounded-full px-4 transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <CalendarDays aria-hidden="true" />
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 rounded-full"
                  aria-label={`Switch calendar view (currently ${view})`}
                >
                  <EllipsisVertical aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-44 rounded-xl p-1.5"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs tracking-wide text-muted-foreground uppercase">
                  View
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={view}
                  onValueChange={changeView}
                >
                  <DropdownMenuRadioItem
                    value="agenda"
                    className="min-h-11 cursor-pointer gap-2 rounded-lg py-2.5 pr-2.5 pl-8"
                  >
                    <List aria-hidden="true" />
                    Agenda
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="month"
                    className="min-h-11 cursor-pointer gap-2 rounded-lg py-2.5 pr-2.5 pl-8"
                  >
                    <CalendarDays aria-hidden="true" />
                    Month
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
