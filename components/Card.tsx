import { Box, Flex, Heading, Text, useColorMode } from "@chakra-ui/react";

export default function Card({
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
  const { colorMode } = useColorMode();

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
          WebkitFilter: "brightness(110%)",
          transform: "scale(.98)",
          transition: "all .2s ease-in-out",
        }}
        minH={"12"}
        bg={colorMode == "dark" ? "gray.600" : color}
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
