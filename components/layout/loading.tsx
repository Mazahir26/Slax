import { Spinner } from "../ui/spinner";

/**
 * Full-screen blocking overlay used while a mutation is in flight.
 * `onClose` is kept in the signature for backwards compatibility with
 * callers that still pass the old disclosure handler.
 */
export default function Loading({
  isOpen,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Saving your changes"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-8 py-6 text-card-foreground shadow-xl">
        <Spinner className="size-8 text-brand" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">
          Saving changes…
        </p>
      </div>
    </div>
  );
}
