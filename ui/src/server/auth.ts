import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"

if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error(`Invalid/Missing environment variable: "DISCORD_CLIENT_ID" '${process.env.DISCORD_CLIENT_ID}'`)
} else if (!process.env.DISCORD_CLIENT_SECRET) {
  throw new Error(`Invalid/Missing environment variable: "DISCORD_CLIENT_SECRET" '${process.env.DISCORD_CLIENT_SECRET}'`)
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({ session }) => ({
      ...session,
      user: {
        ...session.user,
      },
    }),
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
