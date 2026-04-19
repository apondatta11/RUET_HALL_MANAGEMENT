"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Navbar as AceternityNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { 
  Bell, 
  User, 
  History, 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  Wallet, 
  QrCode, 
  CheckCircle,
  Building,
  Users,
  Moon,
  Sun
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const NAV_CONFIG = {
  STUDENT: [
    { name: "Meal Tokens", link: "/tokens", icon: Ticket },
    { name: "Recharge Balance", link: "/recharge", icon: Wallet },
    { name: "Dashboard", link: "/dashboard", icon: LayoutDashboard },
  ],
  MANAGER: [
    { name: "Meal Distribution", link: "/manager/meals", icon: QrCode },
    { name: "Approve Recharges", link: "/manager/recharges", icon: CheckCircle },
    { name: "Dashboard", link: "/manager", icon: LayoutDashboard },
  ],
  ADMIN: [
    { name: "Hall Management", link: "/admin/halls", icon: Building },
    { name: "Manager Directory", link: "/admin/managers", icon: Users },
    { name: "Dashboard", link: "/admin", icon: LayoutDashboard },
  ],
};

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useAppSelector((state) => state.notification);

  const role = session?.user?.role || "STUDENT";
  const userLinks = NAV_CONFIG[role as keyof typeof NAV_CONFIG] || [];
  // type of NAV_CONFIG is Object & key of that objects are the roles 
  const userImage = session?.user?.image;
  const userName = session?.user?.name || "User";

  return (
    <AceternityNavbar className="fixed top-0 translate-y-0">
      {/* Desktop Navigation */}
      <NavBody className="max-w-7xl">
        <div className="flex items-center gap-2">
           <NavbarLogo />
        </div>

        <NavItems items={userLinks} />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {session ? (
            <>
              <Link href="/notifications" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative group">
                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
                )}
              </Link>

              <DropdownMenu>
                {/* part of the profile picture */}
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-all">
                      <AvatarImage src={userImage || ""} alt={userName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                {/* showing the user info */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* showing the user profile and history */}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      <span>History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* logout button */}
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // login and register buttons
            <div className="flex items-center gap-2">
              <NavbarButton as={Link} href="/login" variant="secondary">
                Login
              </NavbarButton>
              <NavbarButton as={Link} href="/register" variant="dark">
                Register
              </NavbarButton>
            </div>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader className="px-4">
          {/* the toggler for mobile navbar */}
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          
          <Link href="/" className="font-black text-lg tracking-tighter">
            RUET<span className="text-primary">HALL</span>
          </Link>

          {session ? (
            <DropdownMenu>
              {/* avatar  */}
              <DropdownMenuTrigger asChild> 
                <button className="outline-none relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userImage || ""} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* settings and account */}
                <DropdownMenuLabel className="font-bold">Settings & Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* theme toggle button */}
                <DropdownMenuItem 
                  onClick={toggleTheme}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>Appearance</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{theme === "dark" ? "Dark" : "Light"}</span>
                </DropdownMenuItem>
                  {/* notification button */}
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                {/* user profile button */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                {/* user history button */}
                <DropdownMenuItem asChild>
                  <Link href="/history" className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                {/* logout button */}
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <NavbarButton as={Link} href="/login" variant="secondary" className="px-3 py-1.5 text-xs">
                Login
              </NavbarButton>
              <NavbarButton as={Link} href="/register" variant="dark" className="px-3 py-1.5 text-xs">
                Register
              </NavbarButton>
            </div>
          )}
        </MobileNavHeader>
        {/* left menu bar */}
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="top-14"
        >
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-2">
              Menu
            </p>
            {userLinks.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.name}</span>
              </Link>
            ))}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </AceternityNavbar>
  );
}
