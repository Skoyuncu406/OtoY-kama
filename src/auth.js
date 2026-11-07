import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },

  pages: {
    signIn: "/admin/login",
  },

  providers: [
    Credentials({
      name: "VICIX Yönetici Girişi",

      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },

      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.email().max(254),
            password: z.string().min(1).max(1024),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();

        const admin = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!admin || !admin.isActive) return null;

        const validPassword = await verifyPassword(
          parsed.data.password,
          admin.passwordHash,
        );

        if (!validPassword) return null;

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
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
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },
});
