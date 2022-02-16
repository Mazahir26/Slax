import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Flex,
  Button,
  Box,
  Heading,
  Spacer,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

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
        <Link passHref href="/">
          <Box
            _focus={{ boxShadow: "none", color: "brand.100" }}
            as="button"
            mx={"5"}
            my={"4"}
          >
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
              variant={"ghost"}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              onClick={() => signIn()}
              variant="solid"
              colorScheme={"brand"}
            >
              Sign up
            </Button>
          </Box>
        )}
        <Button
          mx="2"
          onClick={() => signIn()}
          variant="ghost"
          colorScheme={"brand"}
        >
          About
        </Button>
        <Box mx="2">
          <IconButton
            variant={"ghost"}
            colorScheme={"brand"}
            aria-label="Toggle dark mode"
            icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            onClick={() => toggleColorMode()}
            _focus={{
              boxShadow: "outline",
            }}
          />
        </Box>
      </Flex>
    </Box>
  );
}
