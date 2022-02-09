import { Flex, useDisclosure, useColorMode } from "@chakra-ui/react";
import moment from "moment";
import type { NextPage } from "next";
import { useState } from "react";
import List from "../components/Calender";
import TopBar from "../components/TopBar";
import AddBirthdayModal from "../components/Modal";
type event = {
  name: string;
  date: moment.Moment;
};

const Home: NextPage = (props) => {
  const [events, setEvents] = useState<event[]>([]);
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
        <TopBar
          currentYear={currentYear}
          onOpen={onOpen}
          setCurrentYear={setCurrentYear}
        />
        <List year={currentYear} events={events} />
      </Flex>
      <AddBirthdayModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Home;
