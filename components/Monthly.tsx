import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  Heading,
  VStack,
  useColorMode,
  Button,
  Flex,
} from "@chakra-ui/react";
import moment from "moment";
import Card from "./Card";
import { event } from "./types";

export default function Month({
  events,
  year,
  onClickEvent,
  onClickAddBirthday,
}: {
  events: event[];
  year: moment.Moment;
  onClickEvent: Function;
  onClickAddBirthday: Function;
}) {
  const { colorMode } = useColorMode();
  return (
    <VStack
      p={["1", "4", "6"]}
      width={"full"}
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      {moment.months().map((month, ind) => {
        const isThereABirthdayThisMonth = events.find(
          (o) => o.date.format("MMMM") === month
        );
        if (isThereABirthdayThisMonth)
          return (
            <Box key={(month + ind).toString()}>
              <Heading mt="0.5" py="4" size="lg">
                {isThereABirthdayThisMonth.date.format("MMMM")}{" "}
                {year.format("YYYY")}
              </Heading>

              <VStack px={["1", "2"]} width={"full"}>
                {events.map((day, index) => {
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
                            : day.date.format("DD M") !=
                              events[index - 1].date.format("DD M")
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
              <Flex
                p="4"
                borderRadius="lg"
                boxShadow="md"
                bg={colorMode === "dark" ? "gray.600" : "white"}
                flexDirection="row"
                alignContent={"center"}
                justifyContent={"space-between"}
              >
                <Text
                  isTruncated
                  m="2"
                  noOfLines={1}
                  fontSize={"lg"}
                  fontWeight="semibold"
                >
                  No Birthdays this month 🙁
                </Text>
                <Button
                  display={["none", "flex"]}
                  boxShadow={"lg"}
                  colorScheme={"brand"}
                  onClick={() => onClickAddBirthday()}
                  variant="outline"
                >
                  Add One
                </Button>
              </Flex>
            </Box>
          );
        }
      })}
    </VStack>
  );
}
