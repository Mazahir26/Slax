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
  Link,
} from "@chakra-ui/react";
import { CgProfile } from "react-icons/cg";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import "@fontsource/quicksand/400.css";
// import NextLink from "next/link";
export default function Navbar() {
  const { data: session } = useSession();
  const { toggleColorMode, colorMode } = useColorMode();
  const router = useRouter();
  return (
    <Box alignSelf={"stretch"} alignItems={"stretch"}>
      <Flex
        bg={colorMode === "dark" ? "gray.600" : "white"}
        boxShadow="lg"
        alignItems={"center"}
      >
        <Box as="button" px={"5"} py={"4"} onClick={() => router.push("/")}>
          <Heading fontFamily={"quicksand"} size={"lg"}>
            Slax
          </Heading>
        </Box>

        <Spacer />
        {session ? (
          <Menu variant={"ghost"} colorScheme={"brand"}>
            {({ isOpen }) => (
              <>
                <MenuButton
                  aria-label="Options"
                  bg="transparent"
                  color={
                    isOpen
                      ? "brand.500"
                      : colorMode === "dark"
                      ? "gray.100"
                      : "gray.800"
                  }
                  icon={<Icon w="6" h="6" as={CgProfile} />}
                  as={IconButton}
                  mx="4"
                ></MenuButton>
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
                  <MenuItem onClick={() => {}} color={"red.400"}>
                    Delete Account
                  </MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        ) : (
          <>
            <Box display={["initial", "none"]}>
              <Menu variant={"ghost"} colorScheme={"brand"}>
                {({ isOpen }) => (
                  <>
                    <MenuButton
                      aria-label="Options"
                      bg="transparent"
                      color={
                        isOpen
                          ? "brand.500"
                          : colorMode === "dark"
                          ? "gray.100"
                          : "gray.800"
                      }
                      icon={
                        <Icon
                          w="6"
                          h="6"
                          as={isOpen ? AiOutlineClose : AiOutlineMenu}
                        />
                      }
                      as={IconButton}
                      mx="4"
                    ></MenuButton>
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          router.replace("/");
                          signIn();
                        }}
                      >
                        Sign up
                      </MenuItem>
                      <MenuItem onClick={() => toggleColorMode()}>
                        Change Theme
                      </MenuItem>
                      <MenuItem>About</MenuItem>
                    </MenuList>
                  </>
                )}
              </Menu>
            </Box>
            <Flex flexDirection={"row"} display={["none", "flex"]}>
              <Button
                onClick={() => {
                  router.replace("/dashboard");
                  signIn();
                }}
                variant="solid"
                colorScheme={"brand"}
                fontSize={["sm", "md"]}
              >
                Sign up
              </Button>
              <Button
                mx="2"
                onClick={() => router.push("/about")}
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
          </>
        )}
      </Flex>
    </Box>
  );
}
