import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  Heading,
  VStack,
  useColorMode,
  Flex,
  Button,
} from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
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
  view,
  onClickAddBirthday,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: Function;
  view: "month" | "agenda";
  onClickAddBirthday: Function;
}) {
  const { colorMode } = useColorMode();

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
  // const sortedArray = events.sort((a, b) => {
  //   return moment(a.date).diff(b.date);
  // });

  if (view == "agenda") {
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
            Looks like you haven't added a birthday yet 🤔
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
    return (
      <VStack
        p="6"
        width={"full"}
        bg={colorMode == "dark" ? "gray.700" : "gray.100"}
        alignItems={"stretch"}
      >
        {sortedArray.map((item, index) => {
          if (
            item.date.month() ===
              sortedArray[index === 0 ? 1 : index - 1].date.month() &&
            index !== 0
          ) {
            return (
              <Box px="2">
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
                        sortedArray[index - 1].date.format("DD")
                  }
                />
              </Box>
            );
          } else {
            return (
              <Box px="2">
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
                      : item.date.format("DD") !=
                        sortedArray[index - 1].date.format("DD")
                  }
                />
              </Box>
            );
          }
        })}
      </VStack>
    );
  }

  return (
    <VStack
      p="6"
      width={"full"}
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      {moment.months().map((month, ind) => {
        const isThereABirthdayThisMonth = sortedArray.find(
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
                {sortedArray.map((day, index) => {
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
                              sortedArray[index - 1].date.format("DD")
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
