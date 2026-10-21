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

function connect(uri: string): Promise<MongoClient> {
  try {
    const client = new MongoClient(uri);
    return client.connect();
  } catch (error: unknown) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(`${MISSING_URI_MESSAGE}${detail}`);
  }
}

/**
 * Resolve the shared MongoClient, connecting on first use.
 *
 * Rejects with a human-readable error when the environment is not configured
 * instead of throwing while the module is imported, so a missing database
 * setting cannot take down every route (or the build).
 */
function getClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    return Promise.reject(new Error(MISSING_URI_MESSAGE));
  }

  if (process.env.NODE_ENV === "development") {
    // Keep the connection across HMR reloads.
    if (!globalForMongo._mongoClientPromise) {
      globalForMongo._mongoClientPromise = connect(uri);
    }
    return globalForMongo._mongoClientPromise;
  }

  if (!productionClientPromise) {
    productionClientPromise = connect(uri);
  }
  return productionClientPromise;
}

/**
 * A promise that intentionally never settles. It is only used as the default
 * export when there is no database URI: the NextAuth adapter initializes an
 * internal async block as soon as it is constructed, so handing it a rejecting
 * promise would surface as an unhandled rejection at import time.
 */
const unconfiguredClientPromise = new Promise<MongoClient>(() => {
  // Never resolves; callers should use getDb(), which reports the error.
});

/** Get a database handle by name. Rejects clearly when MONGODB_URI is absent. */
export async function getDb(name: string): Promise<Db> {
  const client = await getClientPromise();
  return client.db(name);
}

/** Default export kept for the NextAuth MongoDB adapter. */
function getDefaultClientPromise(): Promise<MongoClient> {
  if (!getMongoUri()) return unconfiguredClientPromise;

  try {
    return getClientPromise();
  } catch (error: unknown) {
    // A malformed connection string must not crash the module import. Log it
    // once here; API routes report the details through getDb().
    console.error("MONGODB_URI could not be used.", error);
    return unconfiguredClientPromise;
  }
}

const clientPromise: Promise<MongoClient> = getDefaultClientPromise();

export default clientPromise;
