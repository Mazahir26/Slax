"use client";

import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TriangleAlert } from "lucide-react";

type WarningType = "DeleteAccount" | "SignOut";

const copy: Record<
  WarningType,
  { title: string; description: string; confirm: string }
> = {
  SignOut: {
    title: "Sign out of Slax?",
    description:
      "You will be logged out and you will have to verify your email again to sign in.",
    confirm: "Sign out",
  },
  DeleteAccount: {
    title: "Delete your account?",
    description:
      "All of your data will be deleted from our servers. This action is irreversible.",
    confirm: "Delete account",
  },
};

export default function WarningModal({
  isOpen,
  onClose,
  Callback,
  type,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  Callback: () => void;
  type: WarningType;
  isLoading?: boolean;
}) {
  const { title, description, confirm } = copy[type];

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="h-11"
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="h-11"
            disabled={isLoading}
            onClick={(event) => {
              event.preventDefault();
              Callback();
            }}
          >
            {isLoading ? (
              <>
                <Spinner />
                Please wait…
              </>
            ) : (
              confirm
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
