import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TokenType } from "@prisma/client";
import { FEMALE_HALLS, MALE_HALLS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tokenType, hallId } = body;

    if (!tokenType || !["LUNCH", "DINNER"].includes(tokenType)) {
      return NextResponse.json({ error: "Invalid token type" }, { status: 400 });
    }

    if (!hallId) {
      return NextResponse.json({ error: "Hall ID is required" }, { status: 400 });
    }

    // 1. Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Compute tomorrow's date (D) starting at midnight UTC/Local
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // 3. Check if user already purchased a token of this type for tomorrow
    const existingToken = await prisma.mealToken.findFirst({
      where: {
        userId: user.id,
        type: tokenType as TokenType,
        date: tomorrow,
      },
    });

    if (existingToken) {
      return NextResponse.json(
        { error: `You have already purchased a ${tokenType.toLowerCase()} token for tomorrow` },
        { status: 400 }
      );
    }

    // 4. Determine residency type for this specific transaction
    // If the student selects their own registered hallId, it is a Resident Booking.
    const isResidentForTx = user.isResident && user.hallId === hallId;

    // 5. Fetch the target hall
    const hall = await prisma.hall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      return NextResponse.json({ error: "Selected hall not found" }, { status: 404 });
    }

    // Validate gender-based hall restrictions
    if (!user.gender) {
      return NextResponse.json({ error: "User gender not found. Please complete onboarding." }, { status: 400 });
    }

    if (user.gender === "MALE") {
      if (FEMALE_HALLS.includes(hall.name)) {
        return NextResponse.json({ error: "Male students cannot purchase tokens for female halls" }, { status: 400 });
      }
    } else if (user.gender === "FEMALE") {
      if (!FEMALE_HALLS.includes(hall.name)) {
        return NextResponse.json({ error: "Female students can only purchase tokens for female halls" }, { status: 400 });
      }
    }

    // 6. Capacity Checks
    if (!isResidentForTx) {
      // Non-resident booking: Must enforce non-resident capacity limits
      const nonResidentTokensCount = await prisma.mealToken.count({
        where: {
          hallId: hallId,
          type: tokenType as TokenType,
          date: tomorrow,
          isResident: false,
        },
      });

      const capacity =
        tokenType === "LUNCH"
          ? hall.noonNonResidentCapacity
          : hall.nightNonResidentCapacity;

      if (nonResidentTokensCount >= capacity) {
        return NextResponse.json(
          { error: "Out of non-resident capacity slots for this hall tomorrow" },
          { status: 400 }
        );
      }
    }
    // Resident booking is guaranteed ("no matter what"), so we bypass capacity checks.

    // 7. Determine token price from settings
    const priceKey = tokenType === "LUNCH" ? "NOON_PRICE" : "NIGHT_PRICE";
    const setting = await prisma.settings.findUnique({
      where: { key: priceKey },
    });

    const priceValue = setting ? parseFloat(setting.value) : tokenType === "LUNCH" ? 40.0 : 45.0;

    // 8. Validate balance
    const userBalance = parseFloat(user.balance.toString());
    if (userBalance < priceValue) {
      return NextResponse.json(
        { error: "Insufficient balance to purchase this token" },
        { status: 400 }
      );
    }

    // 9. Execute transaction: update balance, create token, and create transaction log
    const result = await prisma.$transaction(async (tx) => {
      // Reload user within transaction to lock the row and get latest balance
      const txUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!txUser) throw new Error("User not found");
      if (parseFloat(txUser.balance.toString()) < priceValue) {
        throw new Error("Insufficient balance");
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: priceValue,
          },
        },
      });

      const token = await tx.mealToken.create({
        data: {
          userId: user.id,
          hallId: hallId,
          type: tokenType as TokenType,
          isResident: isResidentForTx,
          date: tomorrow,
          price: priceValue,
          status: "ACTIVE",
        },
      });

      await tx.balanceTransaction.create({
        data: {
          userId: user.id,
          type: "DEBIT",
          amount: priceValue,
          description: `Purchased ${tokenType.toLowerCase()} token for tomorrow (${hall.name})`,
        },
      });

      return { token, balance: updatedUser.balance };
    });

    return NextResponse.json({
      success: true,
      message: `${tokenType} token successfully purchased for tomorrow`,
      token: result.token,
      newBalance: result.balance,
    });
  } catch (error: any) {
    console.error("Token purchase error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during token purchase" },
      { status: 500 }
    );
  }
}
