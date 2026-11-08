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
    signIn: "/giris-yap",
  },

  providers: [
    Credentials({
      id: "credentials",
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

    Credentials({
      id: "customer-credentials",
      name: "VICIX Müşteri Girişi",

      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },

      async authorize(credentials) {
        const parsed = z
          .object({
            username: z.string().trim().min(1).max(50),
            password: z.string().min(1).max(1024),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const username = parsed.data.username.toLowerCase();

        const customer = await prisma.customer.findUnique({
          where: { username },
        });

        if (!customer || !customer.isActive) return null;

        const validPassword = await verifyPassword(
          parsed.data.password,
          customer.passwordHash,
        );

        if (!validPassword) return null;

        return {
          id: customer.id,
          name: customer.username,
          email: customer.email,
          role: "customer",
          sessionVersion: customer.sessionVersion,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.role === "customer") {
          token.sessionVersion = user.sessionVersion;
        }
      }

      if (token.role === "customer" && token.id) {
        const customer = await prisma.customer.findUnique({
          where: { id: token.id },
          select: {
            username: true,
            email: true,
            isActive: true,
            sessionVersion: true,
          },
        });

        if (!customer || !customer.isActive) {
          return null;
        }

        if (token.sessionVersion !== customer.sessionVersion) {
          return null;
        }

        token.name = customer.username;
        token.email = customer.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }

      return session;
    },
  },
});
