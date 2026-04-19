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

          // ── STAFF-FIRST LOGIC ──
          // We check the database first to see if this is a pre-registered Admin or Manager.
          // This allows them to bypass the strict student roll-number validation.
          const dbuser = await prisma.user.findUnique({
            where: { email },
          });
          if(!dbuser) return null;
          // ── PROVIDER ISOLATION ──
          // If the user exists but has no password, it means they registered via Google.
          // We return null here — the check-provider API handles showing the correct toast.
          // Also managers & admins are also required to login with their password.
          if (!dbuser.passwordHash) return null;
          // if found , check if the user is staff or not
          const isStaff = dbuser && (dbuser.role === "ADMIN" || dbuser.role === "MANAGER");

          if (!isStaff) {
            // If not staff, enforce strict RUET student email validation
            if (!validateRUETEmail(email)) return null;
            // meaning the user was not either a student or stuff, so returning null
          }
          // at this stage, the user who tried to access the login page is either a staff or a student.
          // if (!dbuser || !dbuser.passwordHash) return null;
          // if the user is found but has no password, it means the user is not registered yet.
          const isValid = await bcrypt.compare(password, dbuser.passwordHash);
          if (!isValid) return null;
          
          return {
            id: dbuser.id,
            name: dbuser.name,
            email: dbuser.email,
            role: dbuser.role,
            isResident: dbuser.isResident,
            onboardingCompleted: dbuser.onboardingCompleted,
            hallId: dbuser.hallId,
            roomNumber: dbuser.roomNumber,
          };
        }
        return null;
      },
    }),
],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // 1. Initial Sign-In
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "STUDENT";
        token.isResident = user.isResident ?? false;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.hallId = user.hallId;
        token.roomNumber = user.roomNumber;
        token.name = user.name;
      }

      // 2. Google OAuth Specifics (Initial login only)
      if (account?.provider === "google" && user?.email) {
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
      }

      // 3. Handle Session Updates (e.g. after onboarding)
      // Read the data explicitly passed through `updateSession({ onboardingCompleted: true })`
      if (trigger === "update" && session) {
        if (typeof session.onboardingCompleted !== "undefined") {
           token.onboardingCompleted = session.onboardingCompleted;
        }
        
        // Also fetch from DB just to be perfectly synced, but ensure the token 
        // respects the flags explicitly passed in first.
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });

          if (dbUser) {
            token.role = dbUser.role ?? "STUDENT";
            token.isResident = dbUser.isResident;
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.hallId = dbUser.hallId;
            token.roomNumber = dbUser.roomNumber;
          }
        }
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
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email;

      if (!email) return false;

      // ── PROVIDER ISOLATION ──
      // Check if this user already has a password account. 
      // If they do, we block Google sign-in to prevent account splitting.
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser?.passwordHash) {
        return "/login?error=use_credentials";
      }

      // ── STAFF & STUDENT LOGIC ──
      // 1. If user is already in DB as staff (Admin/Manager), allow login even with personal Gmail.
      const isStaff = existingUser && (existingUser.role === "ADMIN" || existingUser.role === "MANAGER");

      // 2. If not staff, enforce strict RUET student email validation.
      if (!isStaff && !validateRUETEmail(email)) {
        return "/register?error=invalid_ruet_email";
      }

      const roll = email.split("@")[0];

      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: user.name ?? "New User",
          roll: isStaff ? `STAFF_${Date.now()}` : roll, // Staff don't have traditional RUET rolls
          role: existingUser?.role ?? "STUDENT",
          isResident: false,
          onboardingCompleted: false,
        },
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