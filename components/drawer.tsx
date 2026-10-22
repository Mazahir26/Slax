import { useEffect, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment";
import { Loader2, Trash2, X } from "lucide-react";

import Colors from "../lib/colors";
import { editEventSchema } from "../lib/validation";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
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
import type { event } from "./types";

type EditFormInput = z.input<typeof editEventSchema>;
type EditFormOutput = z.output<typeof editEventSchema>;

const DEFAULT_COLOR = Colors[0];

const EMPTY_FORM: EditFormInput = {
  _id: "",
  name: "",
  date: "",
  color: DEFAULT_COLOR,
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toMoment(value: unknown): moment.Moment | null {
  if (moment.isMoment(value)) {
    const parsed = value.clone();
    return parsed.isValid() ? parsed : null;
  }
  if (value instanceof Date) {
    const parsed = moment(value);
    return parsed.isValid() ? parsed : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = moment(value, "YYYY-MM-DD", true);
    return parsed.isValid() ? parsed : null;
  }
  return null;
}

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
  onDelete: (id: string) => Promise<void> | void;
  onSave: (event: event) => Promise<void> | void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EditFormInput, unknown, EditFormOutput>({
    resolver: zodResolver(editEventSchema),
    mode: "onTouched",
    defaultValues: { ...EMPTY_FORM },
  });

  const { isSubmitting } = form.formState;
  const { reset } = form;

  // Prefill (and re-prefill) whenever the sheet opens for a different event.
  useEffect(() => {
    if (!isOpen || !event) return;

    reset({
      _id: event._id,
      name: event.name,
      date: event.date.format("YYYY-MM-DD"),
      color: event.color,
    });
  }, [event, isOpen, reset]);

  const watchedDate = useWatch({ control: form.control, name: "date" });
  const watchedName = useWatch({ control: form.control, name: "name" });
  const parsedDate = toMoment(watchedDate);
  const ageYears =
    parsedDate && parsedDate.isSameOrBefore(moment(), "day")
      ? moment().diff(parsedDate, "years")
      : null;
  const ageDays =
    parsedDate && parsedDate.isSameOrBefore(moment(), "day")
      ? moment().diff(parsedDate, "days")
      : null;

  const today = moment().format("YYYY-MM-DD");
  const oldest = moment().subtract(120, "years").format("YYYY-MM-DD");

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    setConfirmOpen(false);
    if (!isSubmitting && !isDeleting) onClose();
  };

  const onSubmit: SubmitHandler<EditFormOutput> = async (values) => {
    if (!event) return;

    const nextDate = moment(values.date);
    const unchanged =
      event.name === values.name &&
      event.date.format("YYYY-MM-DD") === nextDate.format("YYYY-MM-DD") &&
      event.color.toLowerCase() === values.color.toLowerCase();

    if (unchanged) {
      onClose();
      return;
    }

    try {
      await onSave({
        _id: values._id,
        color: values.color,
        date: nextDate,
        name: capitalize(values.name),
        user: event.user,
      });
      onClose();
    } catch {
      // The dashboard surfaces a toast; keep the sheet open for a retry.
    }
  };

  const handleDelete = async () => {
    if (!event || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(event._id);
      setConfirmOpen(false);
      onClose();
    } catch {
      // The dashboard surfaces a toast; keep the sheet open for a retry.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex w-full flex-col gap-0 overflow-hidden border-l bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b px-5 py-4 pr-14 text-left sm:px-6">
            <SheetTitle className="font-display text-2xl font-semibold">
              Edit Birthday
            </SheetTitle>
            <SheetDescription className="truncate">
              Update {event ? `${event.name}'s` : "this"} details, or remove
              the birthday entirely.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <input type="hidden" {...form.register("_id")} />

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
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
                          value={
                            typeof field.value === "string" ? field.value : ""
                          }
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-11 rounded-xl"
                        />
                      </FormControl>
                      <FormDescription>
                        The date we&apos;ll celebrate every year.
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

                <div className="rounded-xl border border-border bg-muted/50 p-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Stats
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {ageYears !== null && ageDays !== null
                      ? `${watchedName || "They"} is ${ageYears} years old, or ${ageDays} days old.`
                      : "Choose a valid date to see age stats."}
                  </p>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2 border-t bg-card px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isSubmitting || isDeleting}
                  className="h-11 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="h-11 rounded-full"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="h-11 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
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
              </SheetFooter>
            </form>
          </Form>

          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close edit panel"
              className="absolute top-3 right-3 z-10 size-11 rounded-full"
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="z-[60] rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-semibold">
              Delete this birthday?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {event
                ? `${event.name}'s birthday will be removed permanently. This can't be undone.`
                : "This birthday will be removed permanently. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-full" disabled={isDeleting}>
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              className="h-11 rounded-full"
              onClick={(clickEvent) => {
                clickEvent.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
