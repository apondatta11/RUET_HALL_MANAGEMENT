"use client";
// src/components/layout/Sidebar.tsx
// Custom collapsible sidebar using Aceternity's SidebarProvider context only.
// Fixed-position, 68px collapsed → 260px expanded on hover.
// overflow-hidden on the <aside> ensures text is clipped when collapsed.

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Ticket,
  Wallet,
  History,
  User,
  QrCode,
  CheckCircle,
  BarChart3,
  Building,
  Users,
  Settings,
  UploadCloud,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = {
  STUDENT: [
    { label: "Dashboard",   href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Meal Tokens", href: "/student/tokens",    icon: Ticket },
    { label: "Recharge",    href: "/student/recharge",  icon: Wallet },
    { label: "History",     href: "/student/history",   icon: History },
    { label: "My Profile",  href: "/student/profile",   icon: User },
  ],
  MANAGER: [
    { label: "Dashboard",   href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "QR Scanner",  href: "/manager/scan",      icon: QrCode },
    { label: "Approvals",   href: "/manager/recharges", icon: CheckCircle },
    { label: "Meal Report", href: "/manager/report",    icon: BarChart3 },
  ],
  ADMIN: [
    { label: "Dashboard",   href: "/admin/dashboard",   icon: LayoutDashboard },
    { label: "Halls",       href: "/admin/halls",       icon: Building },
    { label: "Residents",   href: "/admin/residents",   icon: UploadCloud },
    { label: "Managers",    href: "/admin/managers",    icon: Users },
    { label: "Settings",    href: "/admin/settings",    icon: Settings },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student Portal",
  MANAGER: "Manager Portal",
  ADMIN:   "Admin Portal",
};

import { AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

// ── Inner sidebar that reads from context ─────────────────────────
export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();

  const role  = (session?.user?.role as keyof typeof NAV_LINKS) ?? "STUDENT";
  const links = NAV_LINKS[role] ?? NAV_LINKS.STUDENT;
  const name  = session?.user?.name  ?? "User";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image ?? "";

  return (
    <>
      {/* ── DESKTOP sidebar ─────────────────────────────────────── */}
      <motion.aside
        animate={{ width: open ? 260 : 68 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="h-screen sticky top-0 z-50 bg-[#091328] border-r border-slate-800/60 overflow-hidden hidden md:flex flex-col shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 shrink-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <div
            className={cn(
              "flex flex-col leading-none transition-opacity duration-200 gap-2",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="text-cyan-400 font-black tracking-tight text-[15px] whitespace-nowrap ">
              RUET Hall
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
              {ROLE_LABELS[role] ?? "Portal"}
            </span>
          </div>
        </div>

        {/* Section label */}
        <div
          className={cn(
            "px-4 pb-2 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">
            Navigation
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                {/* Active left border */}
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-opacity duration-200",
                    open ? "opacity-100" : "opacity-0"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="shrink-0 border-t border-slate-800/60 px-3 py-4 flex flex-col gap-1">
          {/* User row */}
          <div className="flex items-center gap-3 px-3 py-2 min-w-0">
            <Avatar className="w-8 h-8 shrink-0 border border-cyan-400/30">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xs font-bold">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex flex-col min-w-0 transition-opacity duration-200",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-white text-xs font-bold truncate whitespace-nowrap">
                {name}
              </span>
              <span className="text-slate-400 text-[10px] truncate whitespace-nowrap">
                {email}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group w-full"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400 transition-colors" />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-opacity duration-200",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              Logout
            </span>
          </button>
        </div>
    </motion.aside>

      {/* ── MOBILE Sidebar Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#091328] md:hidden flex flex-col h-screen"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-cyan-400 font-black tracking-tight text-[15px]">RUET Hall</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{ROLE_LABELS[role] ?? "Portal"}</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200",
                      isActive ? "bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-6 h-6 shrink-0", isActive ? "text-cyan-400" : "text-slate-400")} />
                    <span className="text-sm font-bold uppercase tracking-[0.14em]">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/60">
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }); }}
                className="flex items-center gap-4 px-4 py-4 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="w-6 h-6 shrink-0" />
                <span className="text-sm font-bold uppercase tracking-[0.14em]">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
