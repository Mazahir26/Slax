import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
export default function ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent
        bg="#ffffffcc"
        w={["20", "36", "44"]}
        h={["20", "36", "44"]}
        justifyContent="center"
        alignItems={"center"}
        alignSelf="center"
      >
        <Spinner
          size={"xl"}
          emptyColor="gray.300"
          color="brand.500"
          speed="0.8s"
          thickness="4px"
        />
      </ModalContent>
    </Modal>
  );
}
