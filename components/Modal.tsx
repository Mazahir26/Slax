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
export default function ({
  isOpen,
  onClose,
  PushEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  PushEvent: Function;
}) {
  const [color, setColor] = useState("#a2d2ff");
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
                name: values.name,
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

// moment(event.target.value).isAfter(moment())
//                   ? setError({ err: "Invalid Date", type: "date" })
//                   : () => {
//                       console.log("oki");
//                       setStartDate(moment(event.target.value)),
//                         error.type === "date"
//                           ? setError({
//                               err: "",
//                               type: "",
//                             })
//                           : {};
//                     }

// <FormControl isRequired>
//             <FormLabel>Name</FormLabel>
//             <Input variant={"flushed"} placeholder="eg. Saitama" />
// <Box my="4" />
// <FormLabel>Date</FormLabel>
// <Input
//   isInvalid={error.type === "date"}
//   variant={"flushed"}
//   value={startDate?.format("YYYY-MM-DD")}
//               onChange={(event) => {
//                 if (moment(event.target.value).isAfter(moment())) {
//                   console.log("after");
//                   setError({ err: "Invalid Date", type: "date" });
//                 } else {
//                   setStartDate(moment(event.target.value));
//                   if (error.type === "date")
//                     setError({
//                       err: "",
//                       type: "",
//                     });
//                 }
//               }}
//               type={"date"}
//             />
//           </FormControl>
