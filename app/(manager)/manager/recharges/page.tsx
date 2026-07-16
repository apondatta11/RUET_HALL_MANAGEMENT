// app/(manager)/manager/recharges/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RechargeQueueClient from "./RechargeQueueClient";

export default async function ManagerRechargesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Fetch all recharge requests along with student details
  const requests = await prisma.rechargeRequest.findMany({
    orderBy: [
      { status: "asc" }, // PENDING will sort before APPROVED/REJECTED alphabetically
      { createdAt: "desc" },
    ],
    include: {
      user: {
        select: {
          name: true,
          roll: true,
        },
      },
    },
  });

  const formattedRequests = requests.map((r) => ({
    id: r.id,
    amount: parseFloat(r.amount.toString()),
    transactionId: r.transactionId,
    provider: r.provider,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reviewNote: r.reviewNote,
    user: {
      name: r.user.name,
      roll: r.user.roll,
    },
  }));

  return <RechargeQueueClient initialRequests={formattedRequests} />;
}
