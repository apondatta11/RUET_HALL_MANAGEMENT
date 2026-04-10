import { PrismaClient } from "@prisma/client";

// WHY THIS PATTERN?
// Next.js in dev mode hot-reloads on every file save.
// Without this, each reload creates a NEW database connection.
// Supabase free tier allows max 20 connections — you'd hit
// that limit in minutes just from development.
// By storing the client on `globalThis`, it survives hot reloads
// and reuses the same single connection.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}