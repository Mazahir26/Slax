import { Box, Flex, Heading, Text, useColorMode } from "@chakra-ui/react";
import moment from "moment";

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
        <Flex
          justifyContent={"space-between"}
          alignItems="center"
          alignContent={"center"}
          flexDirection="column"
          w={["14", "16", "20"]}
        >
          <Heading size={"lg"} mr="2">
            {date.format("Do")}
          </Heading>
          {moment(date).set("year", currentDate.year()).format("L") ===
          moment().format("L") ? (
            <Box p="2" borderRadius={"md"} py="0.5" my="1" bg="brand.100">
              <Text color={"white"}>Today</Text>
            </Box>
          ) : null}
        </Flex>
      ) : null}
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
            <Heading
              isTruncated
              color={colorMode == "dark" ? "white" : getContrast(color)}
              size={"md"}
            >
              {name}'s Birthday
            </Heading>
            <Text
              color={colorMode == "dark" ? "white" : getContrast(color)}
              size={"md"}
            >
              {Math.abs(date.diff(currentDate, "years"))} years old
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}

function getContrast(hexcolor: string) {
  if (hexcolor.slice(0, 1) === "#") {
    hexcolor = hexcolor.slice(1);
  }
  var aRgbHex = hexcolor.match(/.{1,2}/g);
  if (aRgbHex) {
    var Rgb = [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16),
    ];
    const brightness = Math.round(
      (Rgb[0] * 299 + Rgb[1] * 587 + Rgb[2] * 114) / 1000
    );
    return brightness > 125 ? "black" : "white";
  } else return "black";
}
