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
      className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-background/60 p-6 backdrop-blur-sm duration-200 fade-in motion-reduce:animate-none"
      role="status"
      aria-live="polite"
      aria-label="Saving your changes"
    >
      <div className="flex animate-in flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-8 py-6 text-card-foreground shadow-xl duration-200 fade-in zoom-in-95 motion-reduce:animate-none">
        <Spinner className="size-8 text-brand" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">
          Saving changes…
        </p>
      </div>
    </div>
  );
}
