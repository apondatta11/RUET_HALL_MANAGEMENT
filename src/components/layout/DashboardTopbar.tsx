"use client";
// src/components/layout/DashboardTopbar.tsx
// Sticky topbar for all dashboard pages — matches the stitch reference design.
// Contains: page title, search, notification bell, theme toggle, user avatar dropdown.

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, Search, User, LogOut, History, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";

export function DashboardTopbar() {
  const { data: session }        = useSession();
  const { unreadCount }          = useAppSelector((s) => s.notification);
  const { setOpen }              = useSidebar();

  const name  = session?.user?.name  ?? "User";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image ?? "";
  const role  = session?.user?.role  ?? "STUDENT";

  // Role-based profile/history links
  const profileHref = role === "ADMIN" ? "/admin/profile" : role === "MANAGER" ? "/manager/profile" : "/student/profile";
  const historyHref = role === "STUDENT" ? "/student/history" : "#";

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#060e20]/70 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-4 md:px-8 shadow-[0px_8px_32px_rgba(0,0,0,0.4)]">

      {/* ── Left: Title + Search ─── */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* mobile menu button */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-1.5 -ml-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-base md:text-xl font-black tracking-tight text-cyan-400 whitespace-nowrap">
          RUET Hall CMS
        </h2>
        {/* search bar only for large device */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search resources..."
            className="bg-[#192540] border border-slate-800/60 rounded-full py-1.5 pl-9 pr-4 text-xs w-52 xl:w-64 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 transition-all"
          />
        </div>
      </div>

      {/* ── Right: Notifications + ThemeToggle + Avatar ──────── */}
      <div className="flex items-center gap-1 md:gap-2">

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#060e20] animate-pulse" />
          )}
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-slate-800 mx-1" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none ml-1">
              <Avatar className="h-8 w-8 border border-cyan-400/30 hover:border-cyan-400/70 transition-all duration-200 cursor-pointer">
                <AvatarImage src={image} alt={name} />
                <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xs font-black">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#0f1930] border border-slate-800 shadow-xl mt-2"
          >
            {/* User info */}
            <DropdownMenuLabel className="font-normal py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-cyan-400/30">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xs font-black">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-sm truncate">{name}</span>
                  <span className="text-[11px] text-slate-400 truncate">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-800" />

            <DropdownMenuItem asChild>
              <Link
                href={profileHref}
                className="flex items-center cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-slate-800 rounded"
              >
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            {role === "STUDENT" && (
              <DropdownMenuItem asChild>
                <Link
                  href={historyHref}
                  className="flex items-center cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-slate-800 rounded"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-slate-800" />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
