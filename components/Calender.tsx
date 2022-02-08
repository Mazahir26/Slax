import { Box, Flex, Text, Heading, VStack } from "@chakra-ui/react";
import moment from "moment";

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
type event = {
  name: string;
  date: moment.Moment;
};

export default function List({
  events,
  year,
}: {
  events: event[];
  year: moment.Moment;
}) {
  const newArray = events.sort((a, b) => {
    return moment(a.date).diff(b.date);
  });
  return (
    <VStack p="6" width={"full"} bg="gray.100" alignItems={"stretch"}>
      {moment.months().map((month) => {
        const isThereABirthdayThisMonth = newArray.find(
          (o) => o.date.format("MMMM") === month
        );
        if (isThereABirthdayThisMonth)
          return (
            <>
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
              <Box p="4" borderRadius="lg" boxShadow="md" bg="white">
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

function Card({
  color,
  name,
  date,
  newDate,
  currentDate,
}: {
  color: string;
  name: string;
  date: moment.Moment;
  currentDate: moment.Moment;

  newDate: boolean;
}) {
  return (
    <Flex
      alignItems={"center"}
      justifyContent="space-between"
      width={"full"}
      mx="2"
    >
      {newDate ? (
        <Heading size={"lg"} mr="2" w={["14", "16", "20"]}>
          {date.format("Do")}
        </Heading>
      ) : (
        <Box mr="2" w={["14", "16", "20"]} />
      )}
      <Box
        flex={1}
        as="button"
        __css={{
          WebkitFilter: "brightness(100%)",
        }}
        _hover={{
          transform: "scale(1.01)",
          transition: "all .2s ease-in-out",
          WebkitFilter: "brightness(90%)",
        }}
        _active={{
          bg: "#dddfe2",
          transform: "scale(.98)",
          borderColor: "#bec3c9",
          transition: "all .2s ease-in-out",
        }}
        minH={"12"}
        bg={color}
        alignContent={"center"}
        borderRadius="lg"
        boxShadow="md"
        p="4"
        width={"full"}
      >
        <Flex
          flexDirection={"row"}
          justifyContent="flex-start"
          alignItems={"center"}
        >
          <Flex
            flex={1}
            flexDirection="column"
            h="full"
            alignItems="flex-start"
          >
            <Heading isTruncated size={"md"}>
              {name}'s Birthday
            </Heading>
            <Text size={"md"}>
              {Math.abs(date.diff(currentDate, "years"))} years old
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
