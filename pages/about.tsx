import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Link,
  Image,
} from "@chakra-ui/react";
import Footer from "../components/layout/footer";
import Head from "next/head";
export default function About() {
  return (
    <>
      <Head>
        <title>About | Slax </title>
      </Head>
      <Flex px="8" maxW="100vw" minH={"81vh"} flexDirection={"column"}>
        <Box pt="10">
          <Heading size={"2xl"}>Features</Heading>
        </Box>
        <SimpleGrid p="10" columns={[1, 1, 2]} spacing={10}>
          <Card
            content="We send Emails to make sure you get the notification on all your devices, We will send you emails 3 days before the actual date to make sure you to plan something for them"
            heading="Birthday Reminder with Email"
          />
          <Card
            content="Yes, its Open-Source and free, No Catch. Not to mention ad-free. if you find any bug or a feature missing then make sure you contact me on github"
            heading="Free Forever"
          />
          <Card
            content="We made sure that the design of the website is simple and fun. Our website follows a clean and responsive design language."
            heading="Intuitive Design"
          />
          <Card
            content="You can use multi device to access the content of one account, There are no limits on the number of devices per account as well."
            heading="One Account, Multi device"
          />
        </SimpleGrid>
        <Box pt="10">
          <Heading size={"2xl"}>Technology Used</Heading>
        </Box>
        <SimpleGrid p="10" columns={[1, 2, 4]} spacing={10}>
          <Tech
            imageLink="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/640px-Nextjs-logo.svg.png"
            link="https://nextjs.org/"
            heading="Next js"
          />
          <Tech
            imageLink="https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/logo/logomark-colored.svg"
            link="https://chakra-ui.com/"
            heading="Chakra Ui"
          />
          <Tech
            imageLink="https://raw.githubusercontent.com/nextauthjs/next-auth/main/docs/static/img/logo/logo.png"
            link="https://next-auth.js.org/"
            heading="Next Auth"
          />
          <Tech
            imageLink="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/512px-MongoDB_Logo.svg.png"
            link="https://www.mongodb.com/"
            heading="Mongo db"
          />
        </SimpleGrid>
      </Flex>
      <Footer />
    </>
  );
}

interface card {
  heading: string;
  content: string;
}

function Card(props: card) {
  const { heading, content } = props;
  return (
    <Flex
      boxShadow={"lg"}
      maxW={"640px"}
      direction={{ base: "column-reverse", md: "row" }}
      width={"full"}
      rounded={"xl"}
      p={8}
      alignItems="flex-start"
      justifyContent={"space-between"}
      bg={useColorModeValue("white", "gray.700")}
    >
      <Flex direction={"column"} alignItems={"start"}>
        <Heading>{heading}</Heading>
        <Box py="2" />
        <Text fontSize={"md"}>{content}</Text>
      </Flex>
    </Flex>
  );
}

function Tech({
  heading,
  imageLink,
  link,
}: {
  imageLink: string;
  link: string;
  heading: string;
}) {
  return (
    <Flex direction={"column"} justifyContent={"center"} alignItems="center">
      <Box w={["28"]} bg="white" h={"28"} boxShadow="lg" borderRadius="full">
        <Image
          w={["28"]}
          p="2"
          h={"28"}
          objectFit={"contain"}
          alignSelf="center"
          src={imageLink}
          alt="Next Js"
        />
      </Box>
      <Link p="4" href={link} isExternal>
        <Text fontSize={"large"}>{heading}</Text>
      </Link>
    </Flex>
  );
}
