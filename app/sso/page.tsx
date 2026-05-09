"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAllowedRedirect } from "@/lib/domains";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Guard: API_URL must be http/https — prevents SSRF via env misconfiguration
if (API_URL && !API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
    throw new Error(`[CSW SSO] Invalid NEXT_PUBLIC_API_URL: ${API_URL}`);
}

function SSOHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // The URL that the client app wants to be redirected to AFTER SSO completes.
    // This is typically the /auth/callback page on the client app.
    const redirectUrl = searchParams.get("redirect") || searchParams.get("redirect_url");

    useEffect(() => {
        const handleSSO = async () => {
            // ── No redirect target: just go to account dashboard ────────────
            if (!redirectUrl) {
                router.push("/dashboard");
                return;
            }

            // ── Security: validate redirect is a trusted domain ──────────────
            const allowed = await isAllowedRedirect(redirectUrl);
            if (!allowed) {
                console.error("[CSW SSO] Blocked redirect to untrusted domain:", redirectUrl);
                router.push("/dashboard");
                return;
            }

            try {
                // ── Try to get an SSO ticket for the current session ─────────
                // We send credentials:include for same-domain (cookie) auth,
                // AND inject the stored Bearer token for cross-domain (localStorage) auth.
                const storedToken = typeof window !== "undefined"
                    ? localStorage.getItem("csw_token")
                    : null;

                const res = await fetch(`${API_URL}/auth/sso/ticket`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // Inject Bearer token for cross-domain scenarios
                        // (e.g. this auth page is on auth.codeswayam.com but the
                        //  user's JWT came from a localStorage-based login)
                        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
                    },
                    body: JSON.stringify({}),
                    credentials: "include",
                });

                if (res.ok) {
                    const { ticket } = await res.json();
                    console.log("[CSW SSO] Ticket acquired, redirecting to client.");

                    // Redirect back to the client app with the ticket.
                    // The client's /auth/callback page will exchange this ticket for a JWT.
                    const target = new URL(redirectUrl);
                    target.searchParams.set("sso_ticket", ticket);
                    window.location.href = target.toString();

                } else {
                    // ── Not authenticated: redirect to login ─────────────────
                    // CRITICAL: pass the FULL current SSO URL (including ?redirect=...)
                    // as the `redirect` param to login. After login, the user comes back
                    // to this exact URL, and the SSO flow continues seamlessly.
                    console.warn("[CSW SSO] No active session. Redirecting to login.");

                    const loginUrl = new URL("/login", window.location.origin);
                    // Pass only the current SSO path (not full URL) to avoid redirect chain abuse
                    loginUrl.searchParams.set("redirect", window.location.pathname + window.location.search);
                    window.location.href = loginUrl.toString();
                }
            } catch (error) {
                console.error("[CSW SSO] Handshake failed:", error);

                const loginUrl = new URL("/login", window.location.origin);
                loginUrl.searchParams.set("redirect", window.location.pathname + window.location.search);
                window.location.href = loginUrl.toString();
            }
        };

        handleSSO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [redirectUrl]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <h1 className="text-xl font-semibold">Authorizing...</h1>
                <p className="text-muted-foreground text-sm">
                    Securely transferring your session.
                </p>
            </div>
        </div>
    );
}

export default function SSOPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <SSOHandler />
        </Suspense>
    );
}
