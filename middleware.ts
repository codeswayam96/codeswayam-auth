import { NextRequest, NextResponse } from "next/server";
import { isAllowedRedirect } from "@/lib/domains";

/** Strip any protocol/host from a URL — returns only the path+query+hash */
function toSafeRelative(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search + parsed.hash;
    } catch {
        return "/";
    }
}

const PROTECTED_ROUTES = ["/profile", "/account", "/dashboard"];

// Auth routes + SSO must be excluded from the auth-gate to prevent loops.
// /sso is the central redirect handler — it must never be intercepted.
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/sso"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    // Check for both custom and Clerk cookies to be safe
    const authCookie = req.cookies.get("Authentication") || req.cookies.get("__session");
    const isAuthenticated = Boolean(authCookie?.value);

    // ── Protect guarded routes ──────────────────────────────────────────────
    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", req.url);
        // Only pass the relative path — never the full URL — to prevent open redirect
        loginUrl.searchParams.set("redirect", toSafeRelative(req.url));
        return NextResponse.redirect(loginUrl);
    }

    // ── Handle auth routes (user already authenticated) ─────────────────────
    if (isAuthRoute && isAuthenticated) {
        // /sso is special — it ALWAYS processes regardless of auth state.
        // It needs to be reachable even when authenticated so it can issue tickets.
        if (pathname.startsWith("/sso")) {
            return NextResponse.next();
        }

        const redirectParam = req.nextUrl.searchParams.get("redirect");

        if (redirectParam) {
            // Relative paths are always safe — redirect directly
            if (redirectParam.startsWith("/")) {
                return NextResponse.redirect(new URL(redirectParam, req.url));
            }

            // ── Loop guard ─────────────────────────────────────────────────
            // If the redirect target is our own auth domain, don't follow it —
            // it means a double-encoded redirect sneaked through. Fall through
            // to the default redirect instead.
            const authHost = req.nextUrl.hostname;
            try {
                const redirectHost = new URL(redirectParam).hostname;
                if (redirectHost === authHost) {
                    console.warn("[CSW Auth] Loop-guard triggered: redirect points to own domain, using default.");
                } else if (await isAllowedRedirect(redirectParam)) {
                    return NextResponse.redirect(new URL(redirectParam));
                }
            } catch {
                // Invalid URL in redirect param — ignore it
            }
        }

        // Default: send to main platform or local dashboard
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
    matcher: [
        "/profile/:path*",
        "/account/:path*",
        "/dashboard/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/sso",
    ],
};
