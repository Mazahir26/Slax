import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment";
import { Loader2, X } from "lucide-react";

import Colors from "../lib/colors";
import { createEventSchema } from "../lib/validation";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import ColorSelector from "./ColorSelector";
import type { NewBirthday } from "./types";

type CreateFormInput = z.input<typeof createEventSchema>;
type CreateFormOutput = z.output<typeof createEventSchema>;

const DEFAULT_COLOR = Colors[0];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function BirthdayModal({
  isOpen,
  onClose,
  PushEvent,
}: {
  isOpen: boolean;
  onClose: () => void;
  PushEvent: (event: NewBirthday) => Promise<void> | void;
}) {
  const form = useForm<CreateFormInput, unknown, CreateFormOutput>({
    resolver: zodResolver(createEventSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      date: "",
      color: DEFAULT_COLOR,
    },
  });

  const { isSubmitting } = form.formState;
  const { reset } = form;
  const today = moment().format("YYYY-MM-DD");
  const oldest = moment().subtract(120, "years").format("YYYY-MM-DD");

  // Start from a clean form every time the dialog is opened.
  useEffect(() => {
    if (!isOpen) return;
    reset({ name: "", date: "", color: DEFAULT_COLOR });
  }, [isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onClose();
  };

  const onSubmit: SubmitHandler<CreateFormOutput> = async (values) => {
    try {
      await PushEvent({
        name: capitalize(values.name),
        date: moment(values.date),
        color: values.color,
      });
      onClose();
    } catch {
      // The dashboard surfaces a toast; keep the dialog open so the user can
      // fix the problem and try again.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border-border bg-card p-5 text-card-foreground shadow-xl sm:max-w-md sm:p-6"
      >
        <DialogHeader className="gap-1.5 pr-14 text-left">
          <DialogTitle className="font-display text-3xl font-semibold">
            Add a Birthday
          </DialogTitle>
          <DialogDescription>
            A name, a date, and a splash of color. That&apos;s all we need.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg. Saitama"
                      autoComplete="off"
                      autoCapitalize="words"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      max={today}
                      min={oldest}
                      value={typeof field.value === "string" ? field.value : ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="h-11 rounded-xl"
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll remind you every year on this date.
                  </FormDescription>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <span className="text-sm leading-none font-medium">
                    Color
                  </span>
                  <ColorSelector
                    options={Colors}
                    color={
                      typeof field.value === "string"
                        ? field.value
                        : DEFAULT_COLOR
                    }
                    setColor={field.onChange}
                    disabled={isSubmitting}
                  />
                  {fieldState.error?.message ? (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 w-full rounded-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close dialog"
            className="absolute top-3 right-3 z-10 size-11 rounded-full"
          >
            <X aria-hidden="true" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
