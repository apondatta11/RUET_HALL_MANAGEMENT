// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL:   z.string().min(1, "DIRECT_URL is required"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url("Must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(1, "Supabase service role key is required"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL:    z.string().url("Must be a valid URL"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const messages = Object.entries(errors)
    .map(([key, val]) => `  ❌ ${key}: ${val?.join(", ")}`)
    .join("\n");

  throw new Error(
    `\n\n🚨 Invalid environment variables:\n${messages}\n\nFix your .env.local file and restart.\n`
  );
}

export const env = parsed.data;
