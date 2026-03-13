import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/profile"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    // Check for the auth cookie (set by core-api as HttpOnly)
    const authCookie = req.cookies.get("Authentication");
    const isAuthenticated = Boolean(authCookie?.value);

    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isAuthenticated) {
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
    matcher: ["/profile/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};
