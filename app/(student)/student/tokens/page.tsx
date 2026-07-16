// app/(student)/student/tokens/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TokenShopClient from "./TokenShopClient";
import { FEMALE_HALLS } from "@/lib/constants";

export default async function StudentTokensPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/unauthorized");
  }

  // 1. Get current user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch all halls and filter based on user gender
  const allHalls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
  });

  const isFemale = user.gender === "FEMALE";
  const halls = allHalls.filter((h) => {
    const isFemaleHall = FEMALE_HALLS.includes(h.name);
    return isFemale ? isFemaleHall : !isFemaleHall;
  });

  // 3. Compute tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // 4. Fetch tomorrow's active tokens for this user
  const activeTokens = await prisma.mealToken.findMany({
    where: {
      userId: user.id,
      date: tomorrow,
      status: "ACTIVE",
    },
    include: {
      hall: {
        select: {
          name: true,
        },
      },
    },
  });

  // 5. Fetch tomorrow's non-resident sales per hall
  const sales = await prisma.mealToken.groupBy({
    by: ["hallId", "type"],
    where: {
      date: tomorrow,
      isResident: false,
    },
    _count: {
      _all: true,
    },
  });

  const tomorrowSales = sales.map((s) => ({
    hallId: s.hallId,
    type: s.type as "LUNCH" | "DINNER",
    count: s._count._all,
  }));

  // 6. Fetch lunch and dinner prices from Settings table
  const noonSetting = await prisma.settings.findUnique({
    where: { key: "NOON_PRICE" },
  });
  const nightSetting = await prisma.settings.findUnique({
    where: { key: "NIGHT_PRICE" },
  });

  const lunchPrice = noonSetting ? parseFloat(noonSetting.value) : 40.0;
  const nightPrice = nightSetting ? parseFloat(nightSetting.value) : 45.0;

  // Format initial user object for client component
  const initialUser = {
    id: user.id,
    name: user.name,
    balance: parseFloat(user.balance.toString()),
    hallId: user.hallId,
    isResident: user.isResident,
  };

  const formattedHalls = halls.map((h) => ({
    id: h.id,
    name: h.name,
    noonNonResidentCapacity: h.noonNonResidentCapacity,
    nightNonResidentCapacity: h.nightNonResidentCapacity,
  }));

  const formattedActiveTokens = activeTokens.map((t) => ({
    id: t.id,
    type: t.type as "LUNCH" | "DINNER",
    tokenCode: t.tokenCode,
    price: parseFloat(t.price.toString()),
    hall: {
      name: t.hall.name,
    },
  }));

  return (
    <TokenShopClient
      initialUser={initialUser}
      halls={formattedHalls}
      tomorrowSales={tomorrowSales}
      activeTokens={formattedActiveTokens}
      lunchPrice={lunchPrice}
      dinnerPrice={nightPrice}
    />
  );
}
