import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Footer from "../components/layout/footer";

export default function Verification() {
  return (
    <>
      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading textAlign={"center"} fontSize={"4xl"}>
              Successfully Signed Out.
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              {`Bye, Visit again 👋`}
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={4}
          >
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
