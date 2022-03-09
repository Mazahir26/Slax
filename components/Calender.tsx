import { Heading, Flex, Button } from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import Agenda from "./Agenda";
import Month from "./Monthly";
import { event } from "./types";

export default function Calender({
  events,
  year,
  onClickEvent,
  view,
  onClickAddBirthday,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: Function;
  view: "month" | "agenda";
  onClickAddBirthday: Function;
}) {
  const [sortedArray, setSortedArray] = useState(
    events.sort((a, b) =>
      moment(a.date)
        .set("year", moment().year())
        .diff(moment(b.date).set("year", moment().year()))
    )
  );

  useEffect(() => {
    setSortedArray(
      events.sort((a, b) => {
        return moment(a.date).diff(b.date);
      })
    );
  }, [events]);

  if (sortedArray.length === 0) {
    return (
      <Flex
        w="full"
        h="full"
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems="center"
      >
        <Heading textAlign={"center"} mb="7" py="4" size="lg">
          Looks like you haven&apos;t added a birthday yet 🤔
        </Heading>
        <Button
          boxShadow={"lg"}
          colorScheme={"brand"}
          variant="outline"
          onClick={() => onClickAddBirthday()}
        >
          Add Birthday?
        </Button>
      </Flex>
    );
  }
  if (view == "agenda") {
    return (
      <Agenda events={sortedArray} onClickEvent={onClickEvent} year={year} />
    );
  }
  return (
    <Month
      events={sortedArray}
      onClickEvent={onClickEvent}
      year={year}
      onClickAddBirthday={onClickAddBirthday}
    />
  );
}
