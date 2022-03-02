import {
  Flex,
  useDisclosure,
  useColorMode,
  Box,
  Heading,
  useToast,
  Stack,
} from "@chakra-ui/react";
import Drawer from "../components/drawer";
import moment from "moment";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Calender from "../components/Calender";
import TopBar from "../components/TopBar";
import AddBirthdayModal from "../components/Modal";
import { useSession } from "next-auth/react";
import { event } from "../components/types";
import Loading from "../components/layout/loading";
import { Skeleton, SkeletonCircle } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  getEvents,
  addEvent as AddEvent,
  deleteEvent as DeleteEvent,
  editEvent as EditEvent,
} from "../lib/helperFunctions";

const Dashboard: NextPage = ({}) => {
  const [events, setEvents] = useState<event[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
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
  ``;
  const [selectedEvent, setSelectedEvent] = useState<event | null>(null);
  const [view, setView] = useState<"agenda" | "month">("agenda");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      getEvents({
        setEvents: setEvents,
      })
        .catch((err) => {
          router.push("/error?error=ServerError");
          console.log(err);
        })
        .finally(() => setIsConnected(true));
    }
  }, [status]);

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
        <Heading>You need to be authenticated</Heading>
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

  async function editEvent(event: event) {
    if (session?.user?.email) {
      try {
        setLoading();
        const res = await EditEvent(event, events);
        setEvents(res);
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
          title: "Oops something went wrong!",
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

  async function addEvent(event: {
    name: string;
    date: moment.Moment;
    color: string;
  }) {
    if (session?.user?.email) {
      setLoading();
      AddEvent({
        name: event.name,
        date: event.date,
        color: event.color,
        email: session.user.email,
      })
        .then((eve) => {
          setEvents([...events, eve]);
          toast({
            position: "bottom-left",
            title: "Birthday Added. 🎉",
            status: "success",
            description: `We will remind you to wish ${eve.name} on ${moment(
              eve.date
            ).format("MMM Do")} every year`,
            duration: 5000,
            isClosable: true,
          });
        })
        .catch((err) => {
          console.log(err);
          toast({
            position: "bottom-left",
            title: "Oops something went wrong!",
            status: "error",
            description: `Try again later..:(`,
            duration: 5000,
            isClosable: true,
          });
        })
        .finally(() => {
          stopLoading();
        });
    }
  }

  async function deleteEvent(id: string) {
    if (session?.user?.email) {
      setLoading();

      try {
        const res = await DeleteEvent(id, events);
        setEvents(res);
        toast({
          position: "bottom-left",
          title: "Birthday deleted.",
          status: "success",
          description: "Birthday Deleted Successfully",
          duration: 5000,
          isClosable: true,
        });
      } catch (er) {
        console.log(er);
        toast({
          position: "bottom-left",
          title: "Oops something went wrong!",
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

  return (
    <>
      <Head>
        <title>dashboard | Slax </title>
      </Head>
      <Flex
        flexDirection={"column"}
        bg={colorMode == "dark" ? "gray.700" : "gray.100"}
        align={"start"}
        width={"full"}
        h={"90vh"}
      >
        <TopBar
          view={view}
          setView={setView}
          currentYear={currentYear}
          onOpen={onOpen}
          setCurrentYear={setCurrentYear}
        />
        <Calender
          onClickAddBirthday={onOpen}
          view={view}
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

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   try {
//     const session = await getSession(context);
//     if (!session?.user?.email) {
//       return {
//         props: { isConnected: true, data: [] },
//       };
//     }
//     const cli = await client.connect();
//     const database = cli.db("Data");
//     const data = database.collection<eventData>("reminders");

//     const cursor = data.find(
//       {
//         user: session.user.email,
//       },
//       {
//         projection: { _id: 1, date: 1, name: 1, user: 1, color: 1 },
//       }
//     );

//     const propsData = await cursor.toArray();
//     propsData.map((x) => {
//       x.date = moment(x.date).toISOString();
//       x._id = x._id.toString();
//     });
//     cli.close();
//     return {
//       props: { isConnected: true, data: propsData },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: { isConnected: false, data: [] },
//     };
//   }
// }

export default Dashboard;
