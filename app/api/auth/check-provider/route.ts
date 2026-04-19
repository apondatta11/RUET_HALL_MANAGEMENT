// app/api/auth/check-provider/route.ts
// Lightweight endpoint to check which provider a user registered with.
// Called from the login form BEFORE attempting signIn to show the correct toast.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/formatters";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ provider: null });
    }

    const normalized = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { passwordHash: true, role: true },
    });

    if (!user) {
      // User doesn't exist — let signIn handle the "invalid credentials" error
      return NextResponse.json({ provider: null });
    }

    // If the user has a password hash, they registered via credentials (manual)
    // If not, they registered via Google
    return NextResponse.json({
      provider: user.passwordHash ? "credentials" : "google",
      role: user.role,
    });
  } catch {
    return NextResponse.json({ provider: null });
  }
}
