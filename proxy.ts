import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-otp",
  "/unauthorized",
];

const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  const session = await auth();
  const isLoggedIn = !!session;

  const userRole = session?.user?.role as string | undefined;
  const onboardingCompleted = session?.user?.onboardingCompleted as boolean | undefined;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/);

  if (isAuthApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // ── Not logged in → redirect to login ──────────────
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl.origin);
    // Save where they were trying to go contextually
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check valid roles if logged in
  if (isLoggedIn && !userRole && !isPublicRoute) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
  }

  // ── Onboarding Flow Protection ─────────────────────
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  
  if (isLoggedIn && !onboardingCompleted && !isOnboardingRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl.origin));
  }

  // ── Logged in → don't show auth pages ──────────────
  if (
    isLoggedIn &&
    AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl.origin));
    }
    return NextResponse.redirect(
      new URL(getDashboardPath(userRole), nextUrl.origin)
    );
  }

  // ── Role-based protection ───────────────────────────
  if (isLoggedIn && onboardingCompleted) {
    // MANAGER pages — only MANAGER role
    if (pathname.startsWith("/manager") && userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
    }

    // ADMIN pages — only ADMIN role
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
    }

    // STUDENT pages — only STUDENT role
    if (pathname.startsWith("/student") && userRole !== "STUDENT") {
      // If a manager or admin hits a student route, they could be redirected to their dashboard,
      // but unauthorized is safer if they shouldn't access it.
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

function getDashboardPath(role?: string): string {
  switch (role) {
    case "MANAGER":
      return "/manager/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "STUDENT":
    default:
      return "/student/dashboard";
  }
}

// Matcher — which paths the middleware runs on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)",
  ],
};
