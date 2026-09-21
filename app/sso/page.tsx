"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAllowedRedirect } from "@/lib/domains";
import { BrandLoader } from "@/components/brand-loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Guard: API_URL must be http/https — prevents SSRF via env misconfiguration
if (API_URL && !API_URL.startsWith("http://") && !API_URL.startsWith("https://")) {
    throw new Error(`[CSW SSO] Invalid NEXT_PUBLIC_API_URL: ${API_URL}`);
}

function SSOHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                    const target = new URL(redirectUrl, window.location.origin);
                    target.searchParams.set("sso_ticket", ticket);
                    window.location.href = target.toString();

                } else if (res.status === 401) {
                    // ── Not authenticated: redirect to login ─────────────────
                    console.warn("[CSW SSO] No active session. Redirecting to login.");

                    const loginUrl = new URL("/login", window.location.origin);
                    loginUrl.searchParams.set("redirect", window.location.pathname + window.location.search);
                    window.location.href = loginUrl.toString();
                } else {
                    // Backend error (e.g. 404, 500) — DO NOT redirect to /login to prevent infinite loops!
                    console.error("[CSW SSO] Ticket endpoint error, status:", res.status);
                    setErrorMessage(`SSO service received error ${res.status} from backend. Please verify Core API is running.`);
                }
            } catch (error: any) {
                console.error("[CSW SSO] Handshake failed:", error);
                setErrorMessage(error?.message || "Failed to connect to authentication server.");
            }
        };

        handleSSO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [redirectUrl]);

    if (errorMessage) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground text-center">
                <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl max-w-md w-full">
                    <h2 className="text-lg font-bold text-destructive mb-2">SSO Authentication Error</h2>
                    <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            Retry
                        </button>
                        <a
                            href="/dashboard"
                            className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return <BrandLoader fullScreen size="lg" text="Authorizing secure connection..." />;
}

export default function SSOPage() {
    return (
        <Suspense
            fallback={
                <BrandLoader fullScreen size="lg" text="Starting authorization handshake..." />
            }
        >
            <SSOHandler />
        </Suspense>
    );
}
