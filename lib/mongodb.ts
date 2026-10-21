import { MongoClient, type Db } from "mongodb";

const MISSING_URI_MESSAGE =
  "MONGODB_URI is missing or invalid. Set it to a mongodb:// or mongodb+srv:// connection string.";

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

let productionClientPromise: Promise<MongoClient> | null = null;

/** Read and lightly validate the connection string without touching the driver. */
function getMongoUri(): string | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) return null;
  return uri;
}

function readCachedClientPromise(): Promise<MongoClient> | null {
  return process.env.NODE_ENV === "development"
    ? globalForMongo._mongoClientPromise ?? null
    : productionClientPromise;
}

function writeCachedClientPromise(promise: Promise<MongoClient> | null) {
  if (process.env.NODE_ENV === "development") {
    globalForMongo._mongoClientPromise = promise ?? undefined;
  } else {
    productionClientPromise = promise;
  }
}

/**
 * Connect a new client. The returned promise rejects when the driver cannot
 * connect, and a rejection handler is attached immediately so that a caller
 * which forgets to await it cannot trigger an unhandled rejection.
 */
function connect(uri: string): Promise<MongoClient> {
  let client: MongoClient;
  try {
    client = new MongoClient(uri);
  } catch (error: unknown) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    return Promise.reject(new Error(`${MISSING_URI_MESSAGE}${detail}`));
  }

  let promise: Promise<MongoClient>;
  try {
    promise = client.connect();
  } catch (error: unknown) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    return Promise.reject(new Error(`${MISSING_URI_MESSAGE}${detail}`));
  }

  promise.catch((error: unknown) => {
    console.error("Could not connect to MongoDB.", error);
  });

  return promise;
}

/**
 * Resolve the shared MongoClient, connecting on first use.
 *
 * Rejects with a human-readable error when the environment is not configured
 * instead of throwing while the module is imported, so a missing database
 * setting cannot take down every route (or the build). Failed connection
 * attempts are evicted from the cache so a later call can retry.
 */
export function getClient(): Promise<MongoClient> {
  const cached = readCachedClientPromise();
  if (cached) {
    // If a cached promise rejects (e.g. a previous attempt or a stale HMR
    // global), evict it so the next call can retry.
    cached.catch(() => {
      if (readCachedClientPromise() === cached) {
        writeCachedClientPromise(null);
      }
    });
    return cached;
  }

  const uri = getMongoUri();
  if (!uri) {
    return Promise.reject(new Error(MISSING_URI_MESSAGE));
  }

  const promise = connect(uri);
  writeCachedClientPromise(promise);

  // A rejected client promise must not poison the cache forever.
  promise.catch(() => {
    if (readCachedClientPromise() === promise) {
      writeCachedClientPromise(null);
    }
  });

  return promise;
}

/** Get a database handle by name. Rejects clearly when MONGODB_URI is absent. */
export async function getDb(name: string): Promise<Db> {
  const client = await getClient();
  return client.db(name);
}
