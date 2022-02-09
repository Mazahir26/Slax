import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Tab,
  TabList,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import moment from "moment";

export default function TopBar({
  currentYear,
  setCurrentYear,
  onOpen,
}: {
  currentYear: moment.Moment;
  setCurrentYear: Function;
  onOpen: Function;
}) {
  const { colorMode } = useColorMode();

  return (
    <Box
      alignSelf={"stretch"}
      alignContent={"center"}
      borderRadius="lg"
      boxShadow="md"
      bg={colorMode == "dark" ? "gray.600" : "white"}
      p={"4"}
      m="2"
      mx="6"
    >
      <Flex flexDirection={"row"} justifyContent="flex-start">
        <Flex flexDirection={"row"} justifyContent="flex-start">
          <IconButton
            variant={"ghost"}
            aria-label="back"
            icon={<ChevronLeftIcon w={6} h={6} />}
            onClick={() =>
              setCurrentYear(moment(currentYear).subtract(1, "year"))
            }
          />
          <Heading mx="2" size={"lg"} fontWeight="semibold">
            {currentYear.format("YYYY")}
          </Heading>
          <IconButton
            variant={"ghost"}
            aria-label="back"
            icon={<ChevronRightIcon w={6} h={6} />}
            onClick={() => setCurrentYear(moment(currentYear).add(1, "year"))}
          />
        </Flex>
        <Spacer />
        <Button
          boxShadow={"lg"}
          leftIcon={<AddIcon />}
          colorScheme={"brand"}
          onClick={() => onOpen()}
        >
          Add Birthday
        </Button>
        <Box mx="2" />
        <Tabs
          onChange={(index) => {
            console.log(index);
          }}
          variant={"solid-rounded"}
          colorScheme="brand"
        >
          <TabList boxShadow={"lg"} borderRadius="md">
            <Tab borderRightRadius={"none"} borderLeftRadius={"md"}>
              Agenda
            </Tab>
            <Tab borderRightRadius={"md"} borderLeftRadius={"none"}>
              Month
            </Tab>
          </TabList>
        </Tabs>
      </Flex>
    </Box>
  );
}
