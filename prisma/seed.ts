// prisma/seed.ts
// Seeds staff accounts and hall data into the database.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── All RUET halls (must match constants.ts exactly) ──
const ALL_HALLS = [
  "Shere Bangla A.K Fozlul Haque Hall",
  "Shohid Ziaur Rahman Hall",
  "Selim Hall",
  "Hamid Hall",
  "Shohidul Islam Hall",
  "Tinshed Hall",
  "Male Hall-1",
  "Male Hall-2",
  "Male Hall-3",
  "Female Hall-1",
  "Female Hall-2",
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // ── 1. Seed Halls ──
  // console.log("\n📍 Seeding halls...");
  // for (const hallName of ALL_HALLS) {
  //   const hall = await prisma.hall.upsert({
  //     where: { name: hallName },
  //     update: {},
  //     create: { name: hallName },
  //   });
  //   console.log(`  ✅ Hall: ${hall.name}`);
  // }

  // ── 2. Seed Staff Accounts ──
  // console.log("\n👤 Seeding staff accounts...");
  // const passwordHash = await bcrypt.hash("Staff123!", 12);

  // const staffAccounts = [
  //   { email: "admin1@ruet.com", name: "Admin One", roll: "ADM001", role: "ADMIN" as const },
  //   { email: "admin2@ruet.com", name: "Admin Two", roll: "ADM002", role: "ADMIN" as const },
  //   { email: "admin3@ruet.com", name: "Admin Three", roll: "ADM003", role: "ADMIN" as const },
  //   { email: "manager1@ruet.com", name: "Manager One", roll: "MGR001", role: "MANAGER" as const },
  //   { email: "manager2@ruet.com", name: "Manager Two", roll: "MGR002", role: "MANAGER" as const },
  //   { email: "manager3@ruet.com", name: "Manager Three", roll: "MGR003", role: "MANAGER" as const },
  // ];

  // for (const account of staffAccounts) {
  //   const user = await prisma.user.upsert({
  //     where: { email: account.email },
  //     update: {},
  //     create: {
  //       ...account,
  //       passwordHash,
  //       isResident: false,
  //       onboardingCompleted: true, // Staff don't need onboarding
  //     },
  //   });
  //   console.log(`  ✅ ${user.role}: ${user.email}`);
  // }
  const passwordHash = await bcrypt.hash("1234Nowhere", 12);
  const toup = { email: "dattanowhere@gmail.com", name: "Nowhere Admin", roll: "ADMnowhere", role: "ADMIN" as const }
  const user = await prisma.user.upsert({
    where: { email: toup.email },
    update: {},
    create: {
      ...toup,
      passwordHash,
      isResident: false,
      onboardingCompleted: true,
    }
  })
      
  console.log("\n🏁 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
