import { Icon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Flex,
  Button,
  Box,
  Heading,
  Spacer,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { CgProfile } from "react-icons/cg";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

// import NextLink from "next/link";
export default function Navbar() {
  const { data: session } = useSession();
  const { toggleColorMode, colorMode } = useColorMode();
  const router = useRouter();
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
        <Box
          _focus={{ boxShadow: "none", color: "brand.100" }}
          as="button"
          mx={"5"}
          my={"4"}
          onClick={() => router.push("/")}
        >
          <Heading variant={"logo"} size={"lg"}>
            Slax
          </Heading>
        </Box>

        <Spacer />
        {session ? (
          <Menu variant={"ghost"} colorScheme={"brand"}>
            {({ isOpen }) => (
              <>
                <MenuButton mx="4">
                  <IconButton
                    bg="transparent"
                    color={
                      isOpen
                        ? "brand.500"
                        : colorMode === "dark"
                        ? "gray.100"
                        : "gray.800"
                    }
                    aria-label="Options"
                    icon={<Icon w="6" h="6" as={CgProfile} />}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      router.replace("/");
                      signOut();
                    }}
                  >
                    Sign Out
                  </MenuItem>
                  <MenuItem onClick={() => toggleColorMode()}>
                    Change Theme
                  </MenuItem>
                  <MenuItem>About</MenuItem>
                  <MenuItem color={"red.400"}>Delete Account</MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        ) : (
          <Box>
            <Button
              onClick={() => {
                router.replace("/dashboard");
                signIn();
              }}
              variant="solid"
              colorScheme={"brand"}
            >
              Sign up
            </Button>
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
          </Box>
        )}
      </Flex>
    </Box>
  );
}
