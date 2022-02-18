import { Box, Heading, Text, Button } from "@chakra-ui/react";
import Image from "next/image";
import router from "next/router";
import Footer from "../components/layout/footer";

export default function NotFound() {
  return (
    <>
      <Box textAlign="center" py={10} px={6}>
        <Image
          alt="404 Not Found"
          src={"/404.svg"}
          width={"400px"}
          height="400px"
        ></Image>
        <Text fontSize="18px" mt={3} mb={2}>
          Page Not Found
        </Text>
        <Text color={"gray.500"} mb={6}>
          {`Are you lost? let me help you.`}
        </Text>
        <Button
          colorScheme="brand"
          variant="outline"
          onClick={() => router.push("/")}
        >
          Go to Home
        </Button>
      </Box>
      <Footer />
    </>
  );
}
