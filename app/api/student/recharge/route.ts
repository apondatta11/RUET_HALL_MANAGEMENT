import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RechargeProvider } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can request recharge" }, { status: 403 });
    }

    const body = await req.json();
    const { amount, transactionId, provider } = body;

    // Validate fields
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Recharge amount must be a positive number" }, { status: 400 });
    }

    if (!transactionId || typeof transactionId !== "string" || transactionId.trim() === "") {
      return NextResponse.json({ error: "Transaction ID (TxnID) is required" }, { status: 400 });
    }

    if (!provider || !["BKASH", "NAGAD", "ROCKET"].includes(provider)) {
      return NextResponse.json({ error: "Invalid payment provider selected" }, { status: 400 });
    }

    const cleanTxnId = transactionId.trim();

    // Check if the transaction ID was already used
    const existingRequest = await prisma.rechargeRequest.findUnique({
      where: { transactionId: cleanTxnId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted" },
        { status: 400 }
      );
    }

    // Check if transaction ID exists in SmsLog for automated checks (optional future expansion)
    // For now, we save it as PENDING for manual review
    const request = await prisma.rechargeRequest.create({
      data: {
        userId: session.user.id,
        amount: Number(amount),
        transactionId: cleanTxnId,
        provider: provider as RechargeProvider,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recharge request submitted successfully. Waiting for manager review.",
      request,
    });
  } catch (error: any) {
    console.error("Recharge submission error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting your recharge request" },
      { status: 500 }
    );
  }
}
