import { Box, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
export default function Error() {
  const { query } = useRouter();
  return (
    <>
      <Head>
        <title>Error| Slax </title>
      </Head>
      <Box textAlign="center" py={10} px={6}>
        <Box display="inline-block">
          <Image alt="Error " src={"/warning.svg"} height={300} width={300} />
        </Box>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Something went wrong, Try again later.
        </Heading>
        <Text color={"gray.500"}>{query?.error}</Text>
      </Box>
    </>
  );
}
