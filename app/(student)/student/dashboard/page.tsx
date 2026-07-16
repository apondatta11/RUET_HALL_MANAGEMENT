// app/(student)/student/dashboard/page.tsx
// Placeholder student dashboard — Phase 3 will fill this with real stat cards.
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/unauthorized");

  const name = session.user.name ?? "Student";

  return (
    <div className="min-h-screen p-8">
      {/* Top bar */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-1">
          Student Portal
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome back,{" "} 
          {/* {" "}  was given for space between "back," and "Apon"*/}
          <span className="text-cyan-400">{name.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here's what's happening with your hall account today.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Balance" },
          { label: "Active Tokens" },
          { label: "Pending Recharge" },
          { label: "Hall & Room" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-[#0f1930] border border-slate-800/60 p-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
              {card.label}
            </p>
            <div className="h-7 w-24 rounded bg-slate-700/50 animate-pulse" />
          </div>
        ))}
      </div>

      {/* ── Placeholder content areas ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-[#0f1930] border border-slate-800/60 h-72 animate-pulse" />
        <div className="rounded-xl bg-[#0f1930] border border-slate-800/60 h-72 animate-pulse" />
      </div>

      <p className="text-center text-slate-600 text-xs mt-12 uppercase tracking-widest">
        Phase 3 — Balance · Tokens · Recent Activity
      </p>
    </div>
  );
}
