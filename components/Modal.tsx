import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import { useState } from "react";
import ColorSelector from "./ColorSelector";
import options from "../lib/colors";
export default function BirthdayModal({
  isOpen,
  onClose,
  PushEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  PushEvent: Function;
}) {
  const [color, setColor] = useState("#FFFFFF");

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a Birthday</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Formik
            initialValues={{
              name: "",
              date: "",
            }}
            onSubmit={(values, actions) => {
              PushEvent({
                name:
                  values.name.charAt(0).toUpperCase() + values.name.slice(1),
                date: moment(values.date),
                color: color,
              });
              actions.setSubmitting(false);
              onClose();
            }}
          >
            {(props) => (
              <Form>
                <Field name="name" validate={validateName}>
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.name && form.touched.name}
                    >
                      <FormLabel htmlFor="name">First name</FormLabel>
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
                <Flex
                  mt="6"
                  mb="2"
                  flexDirection={"row"}
                  justifyContent="flex-end"
                >
                  <Button
                    colorScheme={"brand"}
                    mr={3}
                    isLoading={props.isSubmitting}
                    type="submit"
                  >
                    Save
                  </Button>

                  <Button onClick={onClose} variant="ghost">
                    Close
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
