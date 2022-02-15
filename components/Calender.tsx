import { Box, Text, Heading, VStack, useColorMode } from "@chakra-ui/react";
import moment from "moment";
import Card from "./Card";
import { event } from "./types";

const colors = [
  "#cdb4db",
  "#ffc8dd",
  "#ffafcc",
  "#bde0fe",
  "#a2d2ff",
  "#f08080",
  "#ff686b",
  "#f2bac9",
  "#ffc09f",
  "#b3e0a3",
  "#ccf5ae",
  "#fec89a",
  "#98f5e1",
  "#fea5be",
  "#a2d2ff",
];

export default function List({
  events,
  year,
  onClickEvent,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: Function;
}) {
  const { colorMode } = useColorMode();
  const newArray = events.sort((a, b) => {
    return moment(a.date).diff(b.date);
  });

  return (
    <VStack
      p="6"
      width={"full"}
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      {newArray.map((item, index) => {
        if (
          index === 0 ||
          (index != 0
            ? true
            : item.date.month() === newArray[index - 1].date.month())
        ) {
          return (
            <Box>
              <Heading mt="0.5" py="4" size="lg">
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
                    : item.date.format("DD") !=
                      newArray[index - 1].date.format("DD")
                }
              />
            </Box>
          );
        } else if (item.date.month() === newArray[index - 1].date.month()) {
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
                : item.date.format("DD") !=
                  newArray[index - 1].date.format("DD")
            }
          />;
        }
      })}
    </VStack>
  );

  return (
    <VStack
      p="6"
      width={"full"}
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      {moment.months().map((month, ind) => {
        const isThereABirthdayThisMonth = newArray.find(
          (o) => o.date.format("MMMM") === month
        );
        if (isThereABirthdayThisMonth)
          return (
            <Box key={(month + ind).toString()}>
              <Heading mt="0.5" py="4" size="lg">
                {isThereABirthdayThisMonth.date.format("MMMM")}{" "}
                {year.format("YYYY")}
              </Heading>

              <VStack px="2" width={"full"}>
                {newArray.map((day, index) => {
                  if (
                    day.date.format("MM") ===
                    isThereABirthdayThisMonth.date.format("MM")
                  ) {
                    return (
                      <Card
                        onClick={(id) => onClickEvent(id)}
                        key={(day.name + index).toString()}
                        id={day._id}
                        currentDate={year}
                        name={day.name}
                        color={day.color}
                        date={day.date}
                        newDate={
                          index === 0
                            ? true
                            : day.date.format("DD") !=
                              newArray[index - 1].date.format("DD")
                        }
                      />
                    );
                  }
                })}
              </VStack>
            </Box>
          );
        else {
          return (
            <Box key={(month + ind).toString()}>
              <Heading mt="0.5" py="4" size="lg">
                {month} {year.format("YYYY")}
              </Heading>
              <Box
                p="4"
                borderRadius="lg"
                boxShadow="md"
                bg={colorMode === "dark" ? "gray.600" : "white"}
              >
                <Text m="2" fontSize={"lg"} fontWeight="semibold">
                  No Birthdays this month 🙁
                </Text>
              </Box>
            </Box>
          );
        }
      })}
    </VStack>
  );
}
