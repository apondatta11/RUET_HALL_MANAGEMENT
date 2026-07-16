// app/(manager)/manager/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ManagerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "MANAGER") redirect("/unauthorized");

  const name = session.user.name ?? "Manager";

  return (
    <div className="min-h-screen p-8">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-1">
          Manager Portal
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome, <span className="text-cyan-400">{name.split(" ")[0]}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage recharge approvals and meal distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {["Pending Approvals", "Tokens Issued Today", "Tokens Used Today", "Remaining Capacity"].map((label) => (
          <div key={label} className="rounded-xl bg-[#0f1930] border border-slate-800/60 p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">{label}</p>
            <div className="h-7 w-24 rounded bg-slate-700/50 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-[#0f1930] border border-slate-800/60 h-72 animate-pulse" />
        <div className="rounded-xl bg-[#0f1930] border border-slate-800/60 h-72 animate-pulse" />
      </div>
    </div>
  );
}
