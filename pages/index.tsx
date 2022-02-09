import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  Heading,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import moment from "moment";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import List from "../components/Calender";
// const events = [
//   {
//     id: 1,
//     startAt: "2021-11-21T18:00:00.000Z",
//     endAt: "2021-11-21T19:00:00.000Z",
//     summary: "test",
//     color: "blue",
//     calendarID: "work",
//   },
//   {
//     id: 2,
//     startAt: "2021-11-21T18:00:00.000Z",
//     endAt: "2021-11-21T19:00:00.000Z",
//     summary: "test",
//     color: "blue",
//   },
// ];

type event = {
  name: string;
  date: moment.Moment;
};

const Home: NextPage = (props) => {
  const [events, setEvents] = useState<event[]>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentYear, setCurrentYear] = useState(moment());
  const { colorMode } = useColorMode();

  return (
    <>
      <Flex
        flexDirection={"column"}
        bg={colorMode == "dark" ? "gray.700" : "gray.100"}
        align={"start"}
        width={"full"}
        h={"90vh"}
      >
        <Box
          alignSelf={"stretch"}
          alignContent={"center"}
          borderRadius="lg"
          boxShadow="md"
          bg={colorMode == "dark" ? "gray.600" : "white"}
          p={"4"}
          m="2"
        >
          <Flex flexDirection={"row"} justifyContent="space-between">
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
                onClick={() =>
                  setCurrentYear(moment(currentYear).add(1, "year"))
                }
              />
            </Flex>
            <Button
              borderRadius={"3xl"}
              leftIcon={<AddIcon />}
              colorScheme={"brand"}
              variant="outline"
              onClick={() => onOpen()}
            >
              Add Birthday
            </Button>
          </Flex>
        </Box>
        <List
          year={currentYear}
          events={[
            {
              name: "person 1",
              date: moment("2002-03-23"),
            },
            {
              name: "person 2",
              date: moment("2002-03-24"),
            },
            {
              name: "person 1",
              date: moment("2003-03-24"),
            },
          ]}
        />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a Birthday</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input placeholder="eg. Saitama" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button color={"#5E7CE2"} mr={3} onClick={onClose}>
              Save
            </Button>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
