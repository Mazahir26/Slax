import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Footer from "../components/layout/footer";

export default function SignIn() {
  const toast = useToast();
  const router = useRouter();
  const { status } = useSession();
  function validateEmail(value: string) {
    let error;
    if (!value) {
      error = "Email is required";
    } else if (
      !value.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      error = "Enter a valid Email";
    }
    return error;
  }
  if (status === "authenticated") {
    router.replace("/dashboard");
  }
  return (
    <>
      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading textAlign={"center"} fontSize={"4xl"}>
              Login to your Account
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              {`We are Password-less 😎`}
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            {status === "loading" ? (
              <Flex justifyContent={"center"}>
                <Spinner
                  size={"md"}
                  emptyColor="gray.300"
                  color="brand.500"
                  speed="0.8s"
                  thickness="2px"
                />
              </Flex>
            ) : (
              <Formik
                onSubmit={async (values, actions) => {
                  try {
                    await signIn("email", {
                      email: values.email,
                      callbackUrl: "/dashboard",
                    });
                  } catch (error) {
                    console.log(error);
                    toast({
                      position: "bottom-left",
                      title: "Oops Something went wrong please try again",
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                    });
                  }
                  actions.setSubmitting(false);
                }}
                initialValues={{ email: "" }}
              >
                {(props) => {
                  return (
                    <Form>
                      <Stack spacing={4}>
                        <Field name="email" validate={validateEmail}>
                          {({ field, form }: any) => (
                            <FormControl
                              isInvalid={
                                form.errors.email && form.touched.email
                              }
                            >
                              <FormLabel htmlFor="email">Email</FormLabel>
                              <Input
                                {...field}
                                id="email"
                                placeholder="eg. john@slax.com"
                              />
                              <FormErrorMessage>
                                {form.errors.email}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        <Stack spacing={5}>
                          <Button
                            colorScheme={"brand"}
                            color={"white"}
                            type="submit"
                            isLoading={props.isSubmitting}
                            disabled={props.errors.email ? true : false}
                          >
                            Send Link
                          </Button>
                          <Text fontSize={"xs"}>
                            {`Click “Send Link” to agree to Slax's Terms of Service
                          and acknowledge that Slax's Privacy Policy applies to
                          you.`}
                          </Text>
                        </Stack>
                      </Stack>
                    </Form>
                  );
                }}
              </Formik>
            )}
          </Box>
        </Stack>
      </Flex>
      <Footer />
    </>
  );
}
