"use client";
// src/components/layout/NavbarWrapper.tsx
// Hides the public Navbar on all role dashboard routes.
// Root layout is a Server Component so it can't use usePathname directly.

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

const DASHBOARD_PREFIXES = ["/student", "/manager", "/admin"];

export function NavbarWrapper() {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  if (isDashboard) return null;
  return <Navbar />;
}
