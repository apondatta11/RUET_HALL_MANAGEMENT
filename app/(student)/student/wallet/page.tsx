// app/(student)/student/wallet/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WalletClient from "./WalletClient";

export default async function StudentWalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // 1. Fetch current user balance details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user's historical transactions ledger
  const transactions = await prisma.balanceTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch user's recharge submissions
  const recharges = await prisma.rechargeRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedTransactions = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount.toString()),
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  const formattedRecharges = recharges.map((r) => ({
    id: r.id,
    amount: parseFloat(r.amount.toString()),
    transactionId: r.transactionId,
    provider: r.provider,
    status: r.status,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <WalletClient
      balance={parseFloat(user.balance.toString())}
      transactions={formattedTransactions}
      recharges={formattedRecharges}
    />
  );
}
