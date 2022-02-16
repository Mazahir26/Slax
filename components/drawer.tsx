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
  Text,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { event } from "./types";
import ColorSelector from "./ColorSelector";

export default function EditDrawer({
  isOpen,
  onClose,
  event,
  onDelete,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: event | null;
  onDelete: (id: string) => void;
  onSave: (event: event) => void;
}) {
  const firstField = useRef();
  const [color, setColor] = useState(event ? event?.color : "#a2d2ff");
  useEffect(() => {
    setColor(event ? event?.color : "#a2d2ff");
  }, [event]);

  if (!event) {
    return <></>;
  }

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
            console.log("okkk");
            onSave({
              _id: event._id,
              color: color,
              date: moment(values.date),
              name: values.name,
              user: event.user,
            });
            actions.setSubmitting(false);
            onClose();
          }}
        >
          {(props) => (
            <Form>
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">
                  Edit Birthday
                </DrawerHeader>
                <DrawerBody>
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
                  <Box my="4" />
                  <FormLabel>Color</FormLabel>
                  <ColorSelector
                    color={color}
                    options={options}
                    setColor={(color) => setColor(color)}
                  />
                  <Box my="4" />
                  <FormLabel>Stats</FormLabel>
                  <Text>
                    {props.values.name} is{" "}
                    {moment().diff(moment(props.values.date), "years")} years
                    old, or {moment().diff(moment(props.values.date), "days")}{" "}
                    days old.
                  </Text>
                </DrawerBody>
                <DrawerFooter borderTopWidth="1px">
                  <Button
                    colorScheme={"red"}
                    mr={3}
                    isLoading={props.isSubmitting}
                    onClick={() => {
                      onDelete(event._id);
                      onClose();
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    isLoading={props.isSubmitting}
                    type="submit"
                    colorScheme="brand"
                  >
                    Save
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Form>
          )}
        </Formik>
      </Drawer>
    </>
  );
}
