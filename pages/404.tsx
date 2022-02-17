import { Box, Heading, Text, Button } from "@chakra-ui/react";
import router from "next/router";

export default function NotFound() {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color={"gray.500"} mb={6}>
        {`The page you're looking for does not seem to exist`}
      </Text>
      <Button
        colorScheme="brand"
        variant="solid"
        onClick={() => router.push("/")}
      >
        Go to Home
      </Button>
    </Box>
  );
}
