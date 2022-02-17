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
              Verification link sent Successfully.
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              {`Just one more step 😁`}
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Text fontSize={"sm"} textAlign="center">
              We have sent a verification link to your email id. The Link is
              only valid for 12 hrs, You can safely close this tab and login in
              through the verification link.
            </Text>
          </Box>
        </Stack>
      </Flex>
      <Footer />
    </>
  );
}
