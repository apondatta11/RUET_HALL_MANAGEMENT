import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const onboardingSchema = z.object({
  isResident: z.boolean(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  hallName: z.string().optional(),
  roomNumber: z.string().optional(),
}).refine((data) => {
  if (data.isResident) {
    return data.gender && data.hallName && data.roomNumber;
  }
  return true;
}, {
  message: "Gender, hall and room number are required for resident students",
  path: ["hallName"],
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { isResident, gender, hallName, roomNumber } = parsed.data;

    let hallId: string | undefined = undefined;
    
    if (isResident && hallName) {
      const hall = await prisma.hall.findUnique({
        where: { name: hallName },
      });
      
      if (!hall) {
        return NextResponse.json(
          { error: "Hall not found" },
          { status: 400 }
        );
      }
      hallId = hall.id;
    }

    const updateData: {
      isResident: boolean;
      gender?: "MALE" | "FEMALE";
      hallId?: string | null;
      roomNumber?: string | null;
      onboardingCompleted: boolean;
    } = {
      isResident,
      onboardingCompleted: true,
    };

    if (isResident && gender) {
      updateData.gender = gender;
    }

    if (isResident && hallId) {
      updateData.hallId = hallId;
    } else {
      updateData.hallId = null;
    }

    if (isResident && roomNumber) {
      updateData.roomNumber = roomNumber;
    } else {
      updateData.roomNumber = null;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, isResident: user.isResident }
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
