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

const Home: NextPage<{ isConnected: boolean; data: eventData[] }> = ({
  isConnected = true,
  data = [],
}) => {
  const [events, setEvents] = useState<event[]>(
    data.map((item) => {
      return {
        name: item.name,
        date: moment(item.date),
      };
    })
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentYear, setCurrentYear] = useState(moment());
  const { data: session, status } = useSession();
  const { colorMode } = useColorMode();

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
        <List
          year={currentYear}
          events={[
            {
              date: moment(),
              name: "mazahir",
            },
            {
              date: moment(),
              name: "diddi",
            },
          ]}
        />
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

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   try {
//     const user = await getSession(context);
//     if (!user?.user?.email) {
//       return {
//         props: { isConnected: true, data: [] },
//       };
//     }
//     const cli = await client.connect();
//     const database = cli.db("Data");
//     const data = database.collection<eventData>("reminders");

//     const cursor = data.find(
//       {
//         user: user.user.email,
//       },
//       {
//         projection: { _id: 0, date: 1, name: 1, user: 1 },
//       }
//     );
//     if ((await cursor.count()) === 0) {
//       console.log("No documents found!");
//     }
//     const propsData: eventData[] = [];
//     cursor.forEach((doc) => {
//       propsData.push({
//         date: doc.date,
//         name: doc.name,
//         user: doc.user,
//       });
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

export default Home;
