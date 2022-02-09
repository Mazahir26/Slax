import { Box, Text, Heading, VStack, useColorMode } from "@chakra-ui/react";
import moment from "moment";
import Card from "./Card";
type event = {
  name: string;
  date: moment.Moment;
};
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
}: {
  events: event[];
  year: moment.Moment;
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
      {moment.months().map((month) => {
        const isThereABirthdayThisMonth = newArray.find(
          (o) => o.date.format("MMMM") === month
        );
        if (isThereABirthdayThisMonth)
          return (
            <>
              <Heading key={Math.random() * 344} mt="0.5" py="4" size="lg">
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
                        currentDate={year}
                        name={day.name}
                        color={colors[(index + 1) % colors.length]}
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
            </>
          );
        else {
          return (
            <>
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
                  No Birthdays this month :(
                </Text>
              </Box>
            </>
          );
        }
      })}
    </VStack>
  );
}
