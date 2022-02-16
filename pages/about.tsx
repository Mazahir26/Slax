import {
  Stack,
  Container,
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  Avatar,
  List,
  chakra,
  Icon,
  useColorModeValue,
  Spacer,
  As,
  UnorderedList,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import Footer from "../components/layout/footer";
import { SiMinutemailer } from "react-icons/si";
import { AiFillDatabase, AiFillGithub } from "react-icons/ai";
export default function About() {
  return (
    <>
      <Flex px="8" w="100vw" minH={"81vh"} flexDirection={"column"}>
        <Box pt="10">
          <Heading size={"2xl"}>About</Heading>
        </Box>
        <Box pt="5">
          <Text fontSize={"xl"}>
            This is a Simple website, Which does one thing reminds you to wish
            people on there birthdays.
          </Text>
        </Box>
        <Heading mt={10} size={"2xl"}>
          Features
        </Heading>
        <List spacing={"4"} px="4" py="4">
          <ListItem fontSize={"x-large"}>
            <ListIcon as={SiMinutemailer} color="brand.500" />
            Email Reminders
          </ListItem>
          <ListItem fontSize={"x-large"}>
            <ListIcon as={AiFillDatabase} color="brand.500" />
            Multi Device Support
          </ListItem>
          <ListItem fontSize={"x-large"}>
            <ListIcon as={AiFillGithub} color="brand.500" />
            Free and Open Source
          </ListItem>
        </List>
        <Spacer />
      </Flex>
      <Footer />
    </>
  );
}
