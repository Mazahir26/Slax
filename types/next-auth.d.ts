import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: NonNullable<DefaultSession["user"]> & {
      /** Stable NextAuth user id captured from the JWT. */
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Stable NextAuth user id, copied from the user on sign in. */
    uid?: string;
  }
}
