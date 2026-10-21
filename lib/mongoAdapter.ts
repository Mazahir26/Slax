import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";
import { getClient } from "@/lib/mongodb";

/**
 * The concrete method signatures implemented by the official MongoDB adapter.
 *
 * `Adapter` models every method as optional and some of them as a union with
 * the newer Auth.js signatures, which makes direct calls awkward. The adapter
 * we lazily build always implements this concrete shape.
 */
type MongoAdapterInstance = {
  createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser>;
  getUser(id: string): Promise<AdapterUser | null>;
  getUserByEmail(email: string): Promise<AdapterUser | null>;
  getUserByAccount(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
  ): Promise<AdapterUser | null>;
  updateUser(
    user: Partial<AdapterUser> & Pick<AdapterUser, "id">
  ): Promise<AdapterUser>;
  deleteUser(userId: string): Promise<void>;
  linkAccount(account: AdapterAccount): Promise<void>;
  unlinkAccount(
    providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
  ): Promise<void>;
  createSession(session: {
    sessionToken: string;
    userId: string;
    expires: Date;
  }): Promise<AdapterSession>;
  getSessionAndUser(sessionToken: string): Promise<{
    session: AdapterSession;
    user: AdapterUser;
  } | null>;
  updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
  ): Promise<AdapterSession | null>;
  deleteSession(sessionToken: string): Promise<AdapterSession | null>;
  createVerificationToken(
    verificationToken: VerificationToken
  ): Promise<VerificationToken>;
  useVerificationToken(params: {
    identifier: string;
    token: string;
  }): Promise<VerificationToken | null>;
};

/**
 * Create a lazy NextAuth adapter backed by MongoDB.
 *
 * The official `MongoDBAdapter` starts resolving its internal `db` promise as
 * soon as it is constructed. Constructing it at module load (before any
 * request) would therefore eagerly touch `MONGODB_URI` and could reject with no
 * handler when the environment is unconfigured. This wrapper defers building
 * the adapter until an adapter method is actually invoked, and retries the
 * construction if the connection attempt fails.
 */
export function createMongoAdapter(databaseName?: string): Adapter {
  let adapterPromise: Promise<MongoAdapterInstance> | null = null;

  function getAdapter(): Promise<MongoAdapterInstance> {
    if (!adapterPromise) {
      adapterPromise = getClient()
        .then((client) => {
          const adapter = MongoDBAdapter(Promise.resolve(client), {
            databaseName,
          });
          return adapter as MongoAdapterInstance;
        })
        .catch((error: unknown) => {
          // Allow a later request to retry after a transient failure.
          adapterPromise = null;
          throw error;
        });
    }
    return adapterPromise;
  }

  return {
    async createUser(
      user: Omit<AdapterUser, "id">
    ): Promise<AdapterUser> {
      return (await getAdapter()).createUser(user);
    },
    async getUser(id: string): Promise<AdapterUser | null> {
      return (await getAdapter()).getUser(id);
    },
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      return (await getAdapter()).getUserByEmail(email);
    },
    async getUserByAccount(
      providerAccountId: Pick<
        AdapterAccount,
        "provider" | "providerAccountId"
      >
    ): Promise<AdapterUser | null> {
      return (await getAdapter()).getUserByAccount(providerAccountId);
    },
    async updateUser(
      user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
      return (await getAdapter()).updateUser(user);
    },
    async deleteUser(userId: string): Promise<void> {
      await (await getAdapter()).deleteUser(userId);
    },
    async linkAccount(account: AdapterAccount): Promise<void> {
      await (await getAdapter()).linkAccount(account);
    },
    async unlinkAccount(
      providerAccountId: Pick<
        AdapterAccount,
        "provider" | "providerAccountId"
      >
    ): Promise<void> {
      await (await getAdapter()).unlinkAccount(providerAccountId);
    },
    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      return (await getAdapter()).createSession(session);
    },
    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      return (await getAdapter()).getSessionAndUser(sessionToken);
    },
    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null> {
      return (await getAdapter()).updateSession(session);
    },
    async deleteSession(
      sessionToken: string
    ): Promise<AdapterSession | null> {
      return (await getAdapter()).deleteSession(sessionToken);
    },
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken> {
      return (await getAdapter()).createVerificationToken(verificationToken);
    },
    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      return (await getAdapter()).useVerificationToken(params);
    },
  };
}
