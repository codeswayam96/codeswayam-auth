import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/profile", "/account"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const ALLOWED_DOMAINS = ["localhost", "codeswayam.com"];

function isAllowedRedirect(url: string): boolean {
    if (url.startsWith("/")) return true;
    try {
        const parsed = new URL(url);
        return ALLOWED_DOMAINS.some(
            (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
        );
    } catch {
        return false;
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    // ONLY check the custom Authentication cookie — we no longer trust __session
    // because that's a Clerk cookie that may be stale or belong to a different
    // session after the user switches auth modes.
    const authCookie = req.cookies.get("Authentication");
    const isAuthenticated = Boolean(authCookie?.value);

    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // If user is already authenticated and visits an auth route,
    // honor the ?redirect param (e.g. from admin-panel or auraflow)
    if (isAuthRoute && isAuthenticated) {
        const redirectParam = req.nextUrl.searchParams.get("redirect");
        if (redirectParam && isAllowedRedirect(redirectParam)) {
            return NextResponse.redirect(new URL(redirectParam));
        }
        const defaultRedirect =
            process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||
            (process.env.NODE_ENV === "production"
                ? "https://www.codeswayam.com/dashboard"
                : "http://localhost:3004/dashboard");
        return NextResponse.redirect(new URL(defaultRedirect));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*", "/account/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};
