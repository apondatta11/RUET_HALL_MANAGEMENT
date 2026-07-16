import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Only managers and admins can review recharges." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { requestId, action, reviewNote } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // 1. Fetch the request
    const rechargeRequest = await prisma.rechargeRequest.findUnique({
      where: { id: requestId },
    });

    if (!rechargeRequest) {
      return NextResponse.json({ error: "Recharge request not found" }, { status: 404 });
    }

    if (rechargeRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: `This request has already been ${rechargeRequest.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const finalReviewNote = reviewNote ? reviewNote.trim() : null;

    // 2. Perform transaction if APPROVED
    if (action === "APPROVE") {
      const result = await prisma.$transaction(async (tx) => {
        // Lock request row and double check status
        const txRequest = await tx.rechargeRequest.findUnique({
          where: { id: requestId },
        });

        if (!txRequest || txRequest.status !== "PENDING") {
          throw new Error("Request has already been processed");
        }

        // Update recharge status
        const updatedRequest = await tx.rechargeRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            reviewedById: session.user.id,
            reviewNote: finalReviewNote,
          },
        });

        // Increment student's balance
        const student = await tx.user.update({
          where: { id: txRequest.userId },
          data: {
            balance: {
              increment: txRequest.amount,
            },
          },
        });

        // Log transaction ledger
        await tx.balanceTransaction.create({
          data: {
            userId: txRequest.userId,
            type: "CREDIT",
            amount: txRequest.amount,
            description: `Balance recharged (TxnID: ${txRequest.transactionId})`,
          },
        });

        return { updatedRequest, newBalance: student.balance };
      });

      return NextResponse.json({
        success: true,
        message: "Recharge request approved and balance credited.",
        request: result.updatedRequest,
      });
    } else {
      // action === "REJECT"
      const updatedRequest = await prisma.rechargeRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedById: session.user.id,
          reviewNote: finalReviewNote,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Recharge request rejected successfully.",
        request: updatedRequest,
      });
    }
  } catch (error: any) {
    console.error("Recharge review error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while reviewing the recharge request" },
      { status: 500 }
    );
  }
}
