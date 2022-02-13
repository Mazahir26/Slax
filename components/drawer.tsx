import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import { useRef, useState } from "react";
import { event } from "./types";
import ColorSelector from "./ColorSelector";

export default function EditDrawer({
  isOpen,
  onClose,
  event,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: event | null;
}) {
  const firstField = useRef();
  const [color, setColor] = useState(event ? event?.color : "white");
  function validateName(value: string) {
    let error;
    if (!value) {
      error = "Name is required";
    }
    return error;
  }

  function validateDate(value: moment.Moment) {
    let error;
    if (!moment(value).isValid()) {
      error = "Invalid Date";
    }
    if (moment(value).isAfter(moment())) {
      error = "Invalid Date";
    }
    return error;
  }

  const options = [
    "#ffc8dd",
    "#a2d2ff",
    "#ff686b",
    "#ffc09f",
    "#b3e0a3",
    "#98f5e1",
    "#fea5be",
    "#FFFFFF",
  ];

  if (!event) {
    return <></>;
  }

  return (
    <>
      <Drawer
        //@ts-ignore
        initialFocusRef={firstField}
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
      >
        <DrawerOverlay />
        <Formik
          initialValues={{
            name: event.name,
            date: event.date.format("YYYY-MM-DD"),
          }}
          onSubmit={(values, actions) => {
            actions.setSubmitting(false);
            onClose();
          }}
        >
          {(props) => (
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Edit Birthday</DrawerHeader>
              <DrawerBody>
                <Form>
                  <Field name="name" validate={validateName}>
                    {({ field, form }: any) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        <FormLabel htmlFor="name">First name</FormLabel>
                        <Input
                          ref={firstField}
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
                        <FormLabel>Date</FormLabel>
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
                </Form>
                <Box my="4" />
                <FormLabel>Color</FormLabel>
                <ColorSelector
                  color={color}
                  options={options}
                  setColor={(color) => setColor(color)}
                />
              </DrawerBody>
              <DrawerFooter borderTopWidth="1px">
                <Button colorScheme={"red"} mr={3} onClick={onClose}>
                  Delete
                </Button>
                <Button colorScheme="brand">Save</Button>
              </DrawerFooter>
            </DrawerContent>
          )}
        </Formik>
      </Drawer>
    </>
  );
}
