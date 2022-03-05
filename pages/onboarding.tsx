import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  Button,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import moment from "moment";

import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "../components/layout/footer";
import { addEvent, getUser } from "../lib/helperFunctions";

export default function newUser() {
  const { status, data: session } = useSession();
  const [isNew, setIsNew] = useState<boolean | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const toast = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      GetUser();
    }
  }, [status]);

  if (status === "loading" || isNew === undefined) {
    return (
      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <Spinner
          size={"xl"}
          emptyColor="gray.300"
          color="brand.500"
          speed="0.8s"
          thickness="4px"
        />
      </Flex>
    );
  }

  function validateName(value: string) {
    let error;
    if (!value && value.length > 0) {
      error = "Name is required";
    }
    return error;
  }

  function validateDate(value: moment.Moment) {
    let error;
    if (!moment(value).isValid()) {
      error = "Invalid Date";
    }
    if (Math.abs(moment(value).diff(moment(), "years")) >= 100) {
      error = "Invalid Date";
    }
    if (moment(value).isAfter(moment())) {
      error = "Invalid Date";
    }
    return error;
  }

  async function GetUser() {
    try {
      const res = await getUser();
      if (res.isNew === false) {
        router.replace("/dashboard");
      } else {
        setIsNew(res.isNew);
      }
    } catch (error) {
      console.log(error);
      router.push("/error?error=ServerError");
    }
  }
  async function setUpUser() {
    if (session?.user?.email) {
      try {
        const response = await fetch("/api/newUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status !== 200) {
          throw Error(response.status.toString());
        }
      } catch (err: any) {
        throw Error(err);
      }
    }
  }

  async function addUser(event: { name: string; date: moment.Moment }) {
    if (session?.user?.email) {
      try {
        await addEvent({
          name: event.name,
          date: event.date,
          color: "#F1BF98",
          email: session.user.email,
          isUser: true,
        });
        await setUpUser();
        router.push("/dashboard");
        toast({
          position: "bottom-left",
          title: "Birthday Added. 🎉",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          position: "bottom-left",
          title: "Oops something went wrong!",
          status: "error",
          description: ` Please Try again ..:(`,
          duration: 5000,
          isClosable: true,
        });
        console.log(err);
      }
    }
  }

  return (
    <>
      <Head>
        <title>Welcome | Slax </title>
      </Head>

      <Flex minH={"85vh"} align={"center"} justify={"center"}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading textAlign={"center"} fontSize={"4xl"}>
              Welcome to Slax
            </Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              {`Add your birthday, Your birthday is important to us! 😁`}
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={6}
          >
            <Formik
              initialValues={{
                name: "",
                date: "",
              }}
              onSubmit={async (values, actions) => {
                await addUser({
                  date: moment(values.date),
                  name: values.name,
                });
                actions.setSubmitting(false);
              }}
            >
              {(props) => (
                <Form>
                  <Field name="name" validate={validateName}>
                    {({ field, form }: any) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        <FormLabel htmlFor="name">Your Name</FormLabel>
                        <Input
                          {...field}
                          variant="flushed"
                          id="name"
                          placeholder="eg. Saitama"
                        />

                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Box my="4" />
                  <Field name="date" validate={validateDate}>
                    {({ field, form }: any) => (
                      <FormControl
                        isInvalid={form.errors.date && form.touched.date}
                      >
                        <FormLabel>Date of Birth</FormLabel>
                        <Input
                          {...field}
                          id="date"
                          type={"date"}
                          variant={"flushed"}
                        />
                        <FormHelperText>Format : MM/DD/YYYY</FormHelperText>

                        <FormErrorMessage>{form.errors.date}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Box my="4" />
                  <Flex
                    mt="6"
                    mb="2"
                    flexDirection={"row"}
                    justifyContent="space-between"
                  >
                    <Button
                      colorScheme={"brand"}
                      mr={3}
                      variant="ghost"
                      isLoading={props.isSubmitting || loading}
                      isDisabled={props.isSubmitting || loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await setUpUser();
                          await router.push("/dashboard");
                        } catch (err) {
                          toast({
                            position: "bottom-left",
                            title: "Oops something went wrong!",
                            status: "error",
                            description: ` Please Try again ..:(`,
                            duration: 5000,
                            isClosable: true,
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Skip
                    </Button>
                    <Button
                      colorScheme={"brand"}
                      mr={3}
                      isLoading={props.isSubmitting || loading}
                      isDisabled={props.isSubmitting || loading}
                      type="submit"
                    >
                      Next
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>
          </Box>
        </Stack>
      </Flex>
      <Footer />
    </>
  );
}
