import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import Footer from "../components/layout/footer";
import WarningModal from "../components/warningModal";

export default function Verification() {
  const session = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const color = useColorModeValue("white", "gray.700");
  useEffect(() => {
    if (session.status == "authenticated") {
      onOpen();
    }
  });
  if (session.status == "authenticated") {
    return (
      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <WarningModal
          isOpen={isOpen}
          onClose={onClose}
          type={"SignOut"}
          Callback={() => signOut({ callbackUrl: "/signout" })}
        />
        <Spinner
          size={"xl"}
          emptyColor="gray.300"
          color="brand.500"
          speed="0.8s"
          thickness="4px"
        />
      </Flex>
    );
  }
  return (
    <>
      <Head>
        <title>Bye Bye | Slax </title>
      </Head>
      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading textAlign={"center"} fontSize={"4xl"}>
              Successfully Signed Out.
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              Bye, Visit again 👋
            </Text>
          </Stack>
          <Box rounded={"lg"} bg={color} boxShadow={"lg"} p={4}>
            <Text fontSize={"sm"} textAlign="center">
              Thank you, Any feedback or suggestions will be appreciated.
            </Text>
          </Box>
        </Stack>
      </Flex>
      <Footer />
    </>
  );
}
