import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/account/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await verifyPassword({
          password,
          passwordHash: user.passwordHash,
        });

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name:
            user.name ??
            [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ??
            user.email,
          role: user.role ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.id ?? token.sub;
        session.user.role = token.role;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

const authRouteHandler = NextAuth(authOptions);

export { authRouteHandler };
