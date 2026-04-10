//app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { validateRUETEmail } from "@/lib/auth";
import { normalizeEmail } from "@/lib/formatters";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).transform((v) => v.trim()),
  email: z.string().email("Invalid email").transform((v) => normalizeEmail(v)),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    if (!validateRUETEmail(email)) {
      return NextResponse.json(
        { error: { email: ["Only RUET student emails (@student.ruet.ac.bd) are allowed"] } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const roll = email.split("@")[0];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        roll,
        passwordHash,
        role: "STUDENT",
        isResident: false,
        onboardingCompleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    // ── FINAL SAFETY NET — DB level unique constraint ──────
    //
    // Prisma surfaces PostgreSQL unique violations as P2002.
    // This catches any duplicate that slips past our logic —
    // including true race conditions where two requests
    // fire within microseconds of each other.
    //
    // meta.target is an array of field names that violated
    // the unique constraint e.g. ["email"] or ["roll"]
    //
    if (error?.code === "P2002") {
      const target = error?.meta?.target as string[] | undefined;
      const field  = target?.includes("email")
        ? "email"
        : target?.includes("roll")
        ? "roll"
        : "general";

      return NextResponse.json(
        {
          error: {
            [field]: [
              field === "general"
                ? "An account with these details already exists"
                : `This ${field} is already registered`,
            ],
          },
        },
        { status: 409 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: { general: ["Registration failed. Please try again."] } },
      { status: 500 }
    );
  }
}
