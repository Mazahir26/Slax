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
import { getCsrfToken, getSession, useSession } from "next-auth/react";
import { eventData, event } from "../components/types";

const Home: NextPage<{ isConnected: boolean; data: eventData[] }> = ({
  isConnected = true,
  data = [],
}) => {
  const [events, setEvents] = useState<event[]>(
    data.map((item) => {
      return {
        name: item.name,
        date: moment(item.date),
        _id: item._id,
        user: item.user,
      };
    })
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentYear, setCurrentYear] = useState(moment());
  const { data: session, status } = useSession();
  const { colorMode } = useColorMode();

  async function addEvent(event: { name: string; date: moment.Moment }) {
    if (session?.user?.email) {
      const csrfToken = await getCsrfToken();
      fetch("/api/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: event.name,
          date: event.date.toISOString(),
        }),
      });
    }
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

  if (!isConnected) {
    return (
      <Box
        width={"full"}
        h={"90vh"}
        flexDirection={"column"}
        bg={colorMode == "dark" ? "gray.700" : "gray.100"}
        justifyContent="center"
        alignItems={"center"}
      >
        <Spinner size={"xl"} />
      </Box>
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
        PushEvent={addEvent}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const session = await getSession(context);
    if (!session?.user?.email) {
      return {
        props: { isConnected: true, data: [] },
      };
    }
    const cli = await client;
    const database = cli.db("Data");
    const data = database.collection<eventData>("reminders");

    const cursor = data.find(
      {
        user: session.user.email,
      },
      {
        projection: { _id: 0, date: 1, name: 1, user: 1 },
      }
    );
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }
    const propsData = await cursor.toArray();
    propsData.map((x) => {
      x.date = moment(x.date).toISOString();
    });
    return {
      props: { isConnected: true, data: propsData },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false, data: [] },
    };
  }
}

export default Home;
