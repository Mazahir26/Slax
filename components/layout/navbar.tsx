import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Flex,
  Button,
  Box,
  Heading,
  Spacer,
  useColorMode,
  Switch,
  IconButton,
} from "@chakra-ui/react";
import { useSession, signIn, signOut } from "next-auth/react";
// import NextLink from "next/link";
export default function Navbar() {
  const { data: session } = useSession();
  const { toggleColorMode, colorMode } = useColorMode();
  return (
    <Box boxShadow="inner" rounded="md" bg="white">
      <Flex bg={"#5E7CE2"} h="10vh" alignItems={"center"}>
        <Box mx={"10"} my={"4"}>
          <Heading color={"whiteAlpha.800"} size={"lg"}>
            Darkest Labs
          </Heading>
        </Box>
        <Spacer />
        <Box mx="8">
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            onClick={() => toggleColorMode()}
          />
        </Box>
        {session ? (
          <Box mx="8">
            <Button
              onClick={() => signOut()}
              colorScheme={"gray"}
              variant={"link"}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box mx="8">
            <Button
              onClick={() => signIn()}
              ringColor={"gray"}
              colorScheme={"gray"}
            >
              Sign up
            </Button>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
