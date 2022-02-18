import { Box, Heading, VStack, useColorMode } from "@chakra-ui/react";
import moment from "moment";
import Card from "./Card";
import { event } from "./types";

export default function Agenda({
  events,
  year,
  onClickEvent,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: Function;
}) {
  const { colorMode } = useColorMode();

  return (
    <VStack
      p={["1", "4", "6"]}
      width={"full"}
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      {events.map((item, index) => {
        if (
          item.date.month() ===
            events[index === 0 ? 0 : index - 1].date.month() &&
          index !== 0
        ) {
          return (
            <Box key={item.user + index} px={["0", "2"]}>
              <Card
                onClick={(id) => onClickEvent(id)}
                key={(item.name + index).toString()}
                id={item._id}
                currentDate={year}
                name={item.name}
                color={item.color}
                date={item.date}
                newDate={
                  index === 0
                    ? true
                    : item.date.format("DD M") !=
                      events[index - 1].date.format("DD M")
                }
              />
            </Box>
          );
        } else {
          return (
            <Box key={item.user + index} px={["0", "2"]}>
              <Heading pt="0.5" py="4" size="lg">
                {item.date.format("MMMM")} {year.format("YYYY")}
              </Heading>
              <Card
                onClick={(id) => onClickEvent(id)}
                key={(item.name + index).toString()}
                id={item._id}
                currentDate={year}
                name={item.name}
                color={item.color}
                date={item.date}
                newDate={
                  index === 0
                    ? true
                    : item.date.format("DD M") !=
                      events[index - 1].date.format("DD M")
                }
              />
            </Box>
          );
        }
      })}
    </VStack>
  );
}
