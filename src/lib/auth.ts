//src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { normalizeEmail } from "./formatters";

// LOGIN schema
const emailLoginSchema = z.object({
  type: z.literal("email"),
  email: z.string().email().transform((v) => normalizeEmail(v)),
  password: z.string().min(1, "Password is required"),
  // Optional as register already will already verify them 
  resident: z.boolean().optional(),
  hallName: z.string().optional(),
  roomNumber: z.string().optional(),
});

const credentialsSchema = z.discriminatedUnion("type", [
  emailLoginSchema,
]);

export function validateRUETEmail(email: string) {
  if (!email.endsWith("@student.ruet.ac.bd")) return false;

  const roll = email.split("@")[0];

  if (!/^\d{7}$/.test(roll)) return false;

  const hsc = roll.slice(0, 2);
  const deptCode = roll.slice(2, 4);
  const serial = parseInt(roll.slice(4, 7));

  const deptLimits: Record<string, number> = {
    "00": 180,
    "01": 180,
    "02": 180,
    "03": 180,
    "04": 60,
    "05": 60,
    "06": 60,
    "07": 60,
    "08": 60,
    "09": 30,
    "10": 60,
    "11": 30,
    "12": 30,
    "13": 60,
  };

  if (serial === 0) return false;
  if (parseInt(hsc) < 18 || parseInt(hsc) > 30) return false;
  if (!deptLimits[deptCode]) return false;
  if (serial < 1 || serial > deptLimits[deptCode]) return false;

  return true;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        type: {},
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (parsed.data.type === "email") {
          const { email, password } = parsed.data;
          // RUET validation for credentials login too
          if (!validateRUETEmail(email)) return null;
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isResident: user.isResident,
            onboardingCompleted: user.onboardingCompleted,
            hallId: user.hallId,
            roomNumber: user.roomNumber,
          };
        }
        return null;
      },
    }),
],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "STUDENT";
        token.isResident = user.isResident ?? false;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.hallId = user.hallId;
        token.roomNumber = user.roomNumber;
        token.name = user.name;
      }

      if (account?.provider === "google" && user?.email) {
        // const isRUETEmail = validateRUETEmail(user.email);
        // token.isRUETEmail = isRUETEmail;
        
        // if (user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role ?? "STUDENT";
            token.isResident = dbUser.isResident;
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.hallId = dbUser.hallId;
            token.roomNumber = dbUser.roomNumber;
          }
        // }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isResident = token.isResident as boolean;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.hallId = token.hallId as string | null | undefined;
        session.user.roomNumber = token.roomNumber as string | null | undefined;
        // if (typeof token.isRUETEmail === "boolean") {
        //   (session.user as unknown as { isRUETEmail: boolean }).isRUETEmail = token.isRUETEmail;
        // }
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
        const email = user.email;

        if (!email || !validateRUETEmail(email)) {
            return "/register?error=invalid_ruet_email";
        }
        const roll = email.split("@")[0];

        await prisma.user.upsert({
          where: { email },
          update: {}, 
          create: {
            email,
            name: user.name ?? "New Student",
            roll,
            role: "STUDENT",
            isResident: false,
            onboardingCompleted: false, 
          }
        });

      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },
});