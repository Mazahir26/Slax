import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
export default function WarningModal({
  isOpen,
  onClose,
  Callback,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  Callback: Function;
  type: "DeleteAccount" | "SignOut";
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are You Sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {type === "SignOut"
            ? "You will be logged out and you will have to verify your email again to sign in."
            : "All the data will be deleted from our servers, This is a irreversible action."}
        </ModalBody>

        <ModalFooter>
          <Button variant={"ghost"} colorScheme="blue" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => Callback()} colorScheme={"red"}>
            {type == "DeleteAccount" ? "Delete Account" : "Sign Out"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
