import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
export default function ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState(moment());
  const [error, setError] = useState({
    err: "",
    type: "",
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a Birthday</ModalHeader>
        <ModalCloseButton />
        <ModalBody></ModalBody>
        <ModalFooter>
          <Button
            disabled={error.type != ""}
            colorScheme={"brand"}
            mr={3}
            onClick={onClose}
          >
            Save
          </Button>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </ModalFooter>
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
//             <Box my="4" />
//             <FormLabel>Date</FormLabel>
//             <Input
//               isInvalid={error.type === "date"}
//               variant={"flushed"}
//               value={startDate?.format("YYYY-MM-DD")}
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
