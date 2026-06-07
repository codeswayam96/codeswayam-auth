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

/**
 * Routes that require authentication.
 * Any request to these paths is rejected at the edge if no auth cookie is present.
 * Using prefix matching — /account also covers /account/profile, /account/security, etc.
 */
const PROTECTED_PREFIXES = [
    "/account",
    "/dashboard",
    "/profile",
    "/invoices",
];

/**
 * Routes that must NEVER be intercepted by the auth gate.
 * - Auth routes: login/signup pages (would create redirect loop)
 * - /sso: the SSO handler must be reachable even when authenticated so it can issue tickets
 */
const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/sso"];

/**
 * Determines whether the request has a valid auth signal.
 *
 * Two cookie strategies are in use across the platform:
 *  1. `Authentication`  — HttpOnly cookie set by core-api on `.codeswayam.com`.
 *                         Shared across all subdomains automatically by the browser.
 *  2. `Authentication`  — JS-accessible cookie written by `useSSOCallback` after
 *                         ticket exchange. Works on custom domains / localhost too.
 *
 * NOTE: localStorage (`csw_token`) is NEVER accessible from Edge middleware.
 * Custom-domain apps that rely solely on localStorage are handled by the client-side
 * AuthGuard — middleware passes them through and lets the app's own guard redirect.
 */
function getAuthCookie(req: NextRequest): string | undefined {
    return (
        req.cookies.get("Authentication")?.value ||
        req.cookies.get("__session")?.value  // Clerk compat fallback
    );
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 1. Check route type ──────────────────────────────────────────────────
    const isPublic    = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const authToken   = getAuthCookie(req);
    const isAuthenticated = Boolean(authToken);

    // ── 2. Guard protected routes AT THE EDGE ───────────────────────────────
    // This is the fix for `GET /account 404 in 206ms`.
    // Previously /account was not in the matcher, so Next.js would start rendering
    // the layout, hit the client-side auth check in useEffect, fail, and log a 404.
    // Now we intercept at the edge — before any page renders.
    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", req.url);
        // Preserve the original destination so login can redirect back
        loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    // ── 3. Redirect authenticated users away from auth pages ────────────────
    if (isPublic && isAuthenticated) {
        // /sso is always open — even when authenticated it must be reachable
        // to issue a ticket for another app's SSO flow.
        if (pathname.startsWith("/sso")) {
            return NextResponse.next();
        }

        const redirectParam = req.nextUrl.searchParams.get("redirect");

        if (redirectParam) {
            // Relative paths are always safe
            if (redirectParam.startsWith("/")) {
                return NextResponse.redirect(new URL(redirectParam, req.url));
            }

            // ── Loop guard ────────────────────────────────────────────────────
            // If the redirect target is our own auth domain, bail out to default.
            const authHost = req.nextUrl.hostname;
            try {
                const redirectHost = new URL(redirectParam).hostname;
                if (redirectHost === authHost) {
                    console.warn("[CSW Auth] Loop-guard: redirect targets own auth domain — using default.");
                } else if (await isAllowedRedirect(redirectParam)) {
                    return NextResponse.redirect(new URL(redirectParam));
                }
            } catch {
                // Malformed URL — ignore
            }
        }

        // Default landing for already-authenticated users hitting login/signup
        const defaultRedirect =
            process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||
            (process.env.NODE_ENV === "production"
                ? "https://www.codeswayam.com/dashboard"
                : "http://localhost:3004/dashboard");
        return NextResponse.redirect(new URL(defaultRedirect));
    }

    // ── 4. All other routes pass through ────────────────────────────────────
    return NextResponse.next();
}

export const config = {
    matcher: [
        // ── Auth routes (redirect authenticated users away) ──────────────────
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/sso",
        // ── Protected routes (redirect unauthenticated users to login) ───────
        "/account/:path*",
        "/dashboard/:path*",
        "/profile/:path*",
        "/invoices/:path*",
    ],
};
