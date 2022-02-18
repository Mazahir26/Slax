import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Icon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Tab,
  TabList,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import moment from "moment";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function TopBar({
  currentYear,
  setCurrentYear,
  onOpen,
  setView,
  view,
}: {
  currentYear: moment.Moment;
  setCurrentYear: Function;
  onOpen: Function;
  view: "agenda" | "month";
  setView: Function;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box
      alignSelf={"stretch"}
      alignContent={"center"}
      borderRadius="lg"
      boxShadow="md"
      bg={colorMode == "dark" ? "gray.600" : "white"}
      px={["1", "4"]}
      py="4"
      my="2"
      mx={["1", "6"]}
    >
      <Flex flexDirection={"row"} justifyContent="flex-start">
        <Flex
          flexDirection={"row"}
          alignItems="center"
          justifyContent="flex-start"
        >
          <IconButton
            variant={"ghost"}
            aria-label="back"
            icon={<ChevronLeftIcon w={["4", "6"]} h={["4", "6"]} />}
            disabled={currentYear.year() <= moment().year()}
            onClick={() =>
              setCurrentYear(moment(currentYear).subtract(1, "year"))
            }
          />
          <Heading size={"lg"} fontWeight="semibold">
            {currentYear.format("YYYY")}
          </Heading>
          <IconButton
            variant={"ghost"}
            aria-label="back"
            icon={<ChevronRightIcon w={["4", "6"]} h={["4", "6"]} />}
            disabled={moment(currentYear).diff(moment(), "years") >= 50}
            onClick={() => setCurrentYear(moment(currentYear).add(1, "year"))}
          />
          {currentYear.year() > moment().year() ? (
            <Button
              mx="2"
              size={"xs"}
              variant={"solid"}
              aria-label="Return to current year"
              colorScheme={"brand"}
              onClick={() =>
                setCurrentYear(moment(currentYear).set("year", moment().year()))
              }
            >
              Today
            </Button>
          ) : null}
        </Flex>
        <Spacer />
        <Button
          display={["none", "flex"]}
          boxShadow={"lg"}
          leftIcon={<AddIcon />}
          colorScheme={"brand"}
          onClick={() => onOpen()}
        >
          Add Birthday
        </Button>
        <IconButton
          variant={"ghost"}
          display={["flex", "none"]}
          aria-label="Add"
          icon={<AddIcon />}
          onClick={() => onOpen()}
        />
        <Box mx={["1", "2"]} />

        <Box display={["initial", "none"]}>
          <Menu variant={"ghost"} colorScheme={"brand"}>
            {({ isOpen }) => (
              <>
                <MenuButton
                  aria-label="Options"
                  bg="transparent"
                  color={
                    isOpen
                      ? "brand.500"
                      : colorMode === "dark"
                      ? "gray.100"
                      : "gray.800"
                  }
                  icon={<Icon w="6" h="6" as={BsThreeDotsVertical} />}
                  as={IconButton}
                ></MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      setView("agenda");
                    }}
                    color={
                      view == "agenda"
                        ? "brand.500"
                        : colorMode == "dark"
                        ? "whiteAlpha.700"
                        : "gray.700"
                    }
                  >
                    Agenda
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setView("month");
                    }}
                    color={
                      view == "month"
                        ? "brand.500"
                        : colorMode == "dark"
                        ? "whiteAlpha.700"
                        : "gray.700"
                    }
                  >
                    Month
                  </MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        </Box>
        <Tabs
          display={["none", "initial"]}
          onChange={(index) => {
            index == 0 ? setView("agenda") : setView("month");
          }}
          variant={"solid-rounded"}
          colorScheme="brand"
          index={view == "agenda" ? 0 : 1}
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
