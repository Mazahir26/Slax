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
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { signIn } from "next-auth/react";
import Footer from "../components/layout/footer";

export default function SignIn() {
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
            <Formik
              onSubmit={async (values, actions) => {
                await signIn("email", { email: values.email });
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
                            isInvalid={form.errors.email && form.touched.email}
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
                          Click “Send Link” to agree to Slax's Terms of Service
                          and acknowledge that Slax's Privacy Policy applies to
                          you.
                        </Text>
                      </Stack>
                    </Stack>
                  </Form>
                );
              }}
            </Formik>
          </Box>
        </Stack>
      </Flex>
      <Footer />
    </>
  );
}
