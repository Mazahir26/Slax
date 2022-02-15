import {
  Flex,
  useDisclosure,
  useColorMode,
  Box,
  Spinner,
  Heading,
  useToast,
  Stack,
} from "@chakra-ui/react";
import Drawer from "../components/drawer";
import moment from "moment";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import List from "../components/Calender";
import TopBar from "../components/TopBar";
import AddBirthdayModal from "../components/Modal";
import client from "../lib/mongodb";
import { getSession, useSession } from "next-auth/react";
import { eventData, event, rawEvent } from "../components/types";
import { InsertOneResult, DeleteResult, UpdateResult } from "mongodb";
import Loading from "../components/layout/loading";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
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
        color: item.color,
      };
    })
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isLoading,
    onOpen: setLoading,
    onClose: stopLoading,
  } = useDisclosure();

  const [currentYear, setCurrentYear] = useState(moment());
  const { data: session, status } = useSession();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [selectedEvent, setSelectedEvent] = useState<event | null>(null);

  async function addEvent(event: {
    name: string;
    date: moment.Moment;
    color: string;
  }) {
    if (session?.user?.email) {
      try {
        setLoading();
        const response = await fetch("/api/createEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: event.name,
            date: event.date.toISOString(),
            color: event.color,
          }),
        });
        if (response.status !== 201) {
          throw Error(response.status.toString());
        }
        const body: InsertOneResult<rawEvent> = await response.json();

        if (body.acknowledged) {
          const insertData: event = {
            _id: body.insertedId.toString(),
            date: moment(event.date),
            name: event.name,
            user: session.user.email,
            color: event.color,
          };
          setEvents([...events, insertData]);
        } else {
          throw Error("Not Acknowledged");
        }
        toast({
          position: "bottom-left",
          title: "Birthday Added.",
          status: "success",
          description: `We will remind you to wish ${event.name} on ${moment(
            event.date
          ).format("MMM Do")} every year`,
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          position: "bottom-left",
          title: "Ops something went wrong!",
          status: "error",
          description: `Try again later..:(`,
          duration: 5000,
          isClosable: true,
        });
      } finally {
        stopLoading();
      }
    }
  }

  async function deleteEvent(id: string) {
    if (session?.user?.email) {
      try {
        setLoading();
        const response = await fetch("/api/deleteEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: id,
          }),
        });
        if (response.status !== 200) {
          throw Error(response.status.toString());
        }

        const body: DeleteResult = await response.json();
        if (body.acknowledged) {
          let temp = events;

          const filtered = temp.filter((value) => value._id !== id);
          setEvents(filtered);
        } else {
          throw Error("Not Acknowledged");
        }
        toast({
          position: "bottom-left",
          title: "Birthday deleted.",
          status: "success",
          description: "Birthday Deleted Successfully",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        toast({
          position: "bottom-left",
          title: "Ops something went wrong!",
          status: "error",
          description: `Try again later..:(`,
          duration: 5000,
          isClosable: true,
        });
      } finally {
        stopLoading();
      }
    }
  }

  async function editEvent(event: event) {
    if (session?.user?.email) {
      try {
        setLoading();
        const response = await fetch("/api/editEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: event._id,
            name: event.name,
            color: event.color,
            date: event.date.toISOString(),
          }),
        });
        if (response.status !== 200) {
          throw Error(response.status.toString());
        }

        const body: UpdateResult = await response.json();
        if (body.acknowledged) {
          let temp = [...events];
          temp.map((x) => {
            if (x._id === event._id) {
              x.color = event.color;
              x.date = event.date;
              x.name = event.name;
            }
          });
          setEvents(temp);
        } else {
          throw Error("Not Acknowledged");
        }
        toast({
          position: "bottom-left",
          title: "Birthday Edited .",
          status: "success",
          description: "Birthday Edited Successfully",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        toast({
          position: "bottom-left",
          title: "Ops something went wrong!",
          status: "error",
          description: `Try again later..:(`,
          duration: 5000,
          isClosable: true,
        });
      } finally {
        stopLoading();
      }
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
      <Stack pt="10" spacing={"6"} px="6">
        <Flex alignItems={"center"} flexDir={"row"}>
          <SkeletonCircle height="20" width={"20"} />
          <Box mx="4" />
          <Skeleton height="16" width={"full"} />
        </Flex>
        <Box my="4" />

        <Skeleton height="16" />
        <Skeleton height="16" />
        <Flex alignItems={"center"} flexDir={"row"}>
          <SkeletonCircle height="20" width={"20"} />
          <Box mx="4" />
          <Skeleton height="16" width={"full"} />
        </Flex>
        <Box my="4" />

        <Skeleton height="16" />
        <Skeleton height="16" />
      </Stack>
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
        <List
          onClickEvent={(id: string) => {
            const selected = events.find((value) => value._id === id);
            selected ? setSelectedEvent(selected) : null;
            onDrawerOpen();
          }}
          year={currentYear}
          events={events}
        />
      </Flex>
      <AddBirthdayModal
        PushEvent={addEvent}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Drawer
        event={selectedEvent}
        onClose={onDrawerClose}
        isOpen={isDrawerOpen}
        onDelete={(id) => deleteEvent(id)}
        onSave={(event) => editEvent(event)}
      />
      <Loading isOpen={isLoading} onClose={stopLoading} />
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
    const cli = await client.connect();
    const database = cli.db("Data");
    const data = database.collection<eventData>("reminders");

    const cursor = data.find(
      {
        user: session.user.email,
      },
      {
        projection: { _id: 1, date: 1, name: 1, user: 1, color: 1 },
      }
    );
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }
    const propsData = await cursor.toArray();
    propsData.map((x) => {
      x.date = moment(x.date).toISOString();
      x._id = x._id.toString();
    });
    cli.close();
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
