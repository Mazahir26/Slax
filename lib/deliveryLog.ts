import type { Collection, Db } from "mongodb";

/** The two independently rate-limited email kinds. */
export type DeliveryKind = "reminder" | "birthday";

/** One claim per user, local calendar day and kind. */
export interface DeliveryDocument {
  user: string;
  /** `YYYY-MM-DD` in the user's own timezone. */
  localDate: string;
  kind: DeliveryKind;
  status: "sending" | "sent";
  createdAt: Date;
  sentAt?: Date;
}

export const DELIVERY_COLLECTION = "email_deliveries";

/** Claims are only interesting for a short while; keep them for 60 days. */
export const DELIVERY_TTL_SECONDS = 60 * 24 * 60 * 60;

/**
 * Index builds are cached per database name so a process only issues them
 * once, while tests can still use a throwaway database.
 */
const indexPromises = new Map<string, Promise<void>>();

function deliveryCollection(db: Db): Collection<DeliveryDocument> {
  return db.collection<DeliveryDocument>(DELIVERY_COLLECTION);
}

/** True for a MongoDB duplicate-key error (`E11000`). */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/**
 * Ensure the unique claim index and the TTL index exist.
 *
 * Both operations are idempotent in MongoDB. A failed build is evicted from
 * the cache so a later run can retry.
 */
export function ensureDeliveryIndexes(db: Db): Promise<void> {
  const cacheKey = db.databaseName;
  const cached = indexPromises.get(cacheKey);
  if (cached) return cached;

  const collection = deliveryCollection(db);
  const promise = (async () => {
    await collection.createIndex(
      { user: 1, localDate: 1, kind: 1 },
      { unique: true, name: "unique_user_day_kind" }
    );
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: DELIVERY_TTL_SECONDS, name: "delivery_ttl" }
    );
  })().catch((error: unknown) => {
    indexPromises.delete(cacheKey);
    throw error;
  });

  indexPromises.set(cacheKey, promise);
  return promise;
}

/**
 * Atomically claim the right to send one email.
 *
 * The unique index makes this safe across concurrent runs: exactly one caller
 * inserts the document, every other caller sees `E11000` and gets `false`.
 * Any other database error is propagated.
 */
export async function claimDelivery(
  db: Db,
  user: string,
  localDate: string,
  kind: DeliveryKind
): Promise<boolean> {
  try {
    await deliveryCollection(db).insertOne({
      user,
      localDate,
      kind,
      status: "sending",
      createdAt: new Date(),
    });
    return true;
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) return false;
    throw error;
  }
}

/** Mark a previously claimed delivery as successfully sent. */
export async function markDeliverySent(
  db: Db,
  user: string,
  localDate: string,
  kind: DeliveryKind
): Promise<void> {
  const result = await deliveryCollection(db).updateOne(
    { user, localDate, kind },
    { $set: { status: "sent", sentAt: new Date() } }
  );
  if (!result.acknowledged) {
    throw new Error("Delivery update was not acknowledged.");
  }
}

/**
 * Delete a claim after a failed send so a later run may retry the same
 * `{user, localDate, kind}` triple.
 */
export async function releaseDelivery(
  db: Db,
  user: string,
  localDate: string,
  kind: DeliveryKind
): Promise<void> {
  const result = await deliveryCollection(db).deleteOne({
    user,
    localDate,
    kind,
  });
  if (!result.acknowledged) {
    throw new Error("Delivery release was not acknowledged.");
  }
}
