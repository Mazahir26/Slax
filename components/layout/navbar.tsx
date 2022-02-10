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
  Link,
} from "@chakra-ui/react";
import { useSession, signIn, signOut } from "next-auth/react";
// import NextLink from "next/link";
export default function Navbar() {
  const { data: session } = useSession();
  const { toggleColorMode, colorMode } = useColorMode();
  return (
    <Box
      h="10vh"
      bg={colorMode == "dark" ? "gray.700" : "gray.100"}
      alignItems={"stretch"}
    >
      <Flex
        bg={colorMode === "dark" ? "gray.600" : "white"}
        boxShadow="lg"
        alignItems={"center"}
      >
        <Link href="/">
          <Box mx={"5"} my={"4"}>
            <Heading variant={"logo"} size={"lg"}>
              Slax
            </Heading>
          </Box>
        </Link>

        <Spacer />
        {session ? (
          <Box>
            <Button
              onClick={() => signOut()}
              colorScheme={"gray"}
              variant={"link"}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box>
            <Button onClick={() => signIn()} colorScheme={"brand"}>
              Sign up
            </Button>
          </Box>
        )}
        <Box mx="4">
          <IconButton
            colorScheme={"brand"}
            aria-label="Toggle dark mode"
            icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            onClick={() => toggleColorMode()}
          />
        </Box>
      </Flex>
    </Box>
  );
}
