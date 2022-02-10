import {
  Flex,
  useDisclosure,
  useColorMode,
  Box,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import moment from "moment";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import List from "../components/Calender";
import TopBar from "../components/TopBar";
import AddBirthdayModal from "../components/Modal";
import client from "../lib/mongodb";
import { getSession, useSession } from "next-auth/react";
type event = {
  name: string;
  date: moment.Moment;
};

const Home: NextPage<{ isConnected: boolean }> = ({ isConnected = true }) => {
  const [events, setEvents] = useState<event[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentYear, setCurrentYear] = useState(moment());
  const { data: session, status } = useSession();
  const { colorMode } = useColorMode();
  if (!isConnected) {
    return (
      <Box w="full" h="full" alignContent={"center"} justifyContent="center">
        <Spinner size={"xl"} />
      </Box>
    );
  }
  if (status === "unauthenticated") {
    return (
      <Flex
        width={"full"}
        h={"90vh"}
        flexDirection={"column"}
        bg={colorMode == "dark" ? "gray.700" : "gray.100"}
        justifyContent="center"
        alignItems={"center"}
      >
        <Heading>You need to sign up</Heading>
      </Flex>
    );
  }
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
      <AddBirthdayModal
        PushEvent={(event: event) => setEvents([...events, event])}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

interface eventData {
  name: string;
  date: Date;
  user: string;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const user = await getSession(context);
    if (!user?.user?.email) {
      return {
        props: { isConnected: true },
      };
    }
    const cli = await client;
    const database = cli.db("Data");
    const data = database.collection<eventData>("reminders");
    const result = await data.insertOne({
      date: moment().toDate(),
      user: user.user.email,
      name: "mazahir",
    });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    cli.close();
    return {
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}
export default Home;
