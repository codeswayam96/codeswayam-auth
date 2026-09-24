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
        let isMounted = true;

        const handleSSO = async () => {
            // ── No redirect target: just go to account dashboard ────────────
            if (!redirectUrl) {
                if (isMounted) router.push("/dashboard");
                return;
            }

            // ── Security: validate redirect is a trusted domain ──────────────
            const allowed = await isAllowedRedirect(redirectUrl);
            if (!isMounted) return;

            if (!allowed) {
                console.error("[CSW SSO] Blocked redirect to untrusted domain:", redirectUrl);
                router.push("/dashboard");
                return;
            }

            // Retry loop for transient network glitches & React StrictMode unmount races
            const MAX_RETRIES = 3;
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                if (!isMounted) return;

                try {
                    // ── Try to get an SSO ticket for the current session ─────────
                    const storedToken = typeof window !== "undefined"
                        ? localStorage.getItem("csw_token")
                        : null;

                    const res = await fetch(`${API_URL}/auth/sso/ticket`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
                        },
                        body: JSON.stringify({}),
                        credentials: "include",
                    });

                    if (!isMounted) return;

                    if (res.ok) {
                        const { ticket } = await res.json();
                        console.log("[CSW SSO] Ticket acquired, redirecting to client.");

                        // Redirect back to the client app with the ticket.
                        const target = new URL(redirectUrl, window.location.origin);
                        target.searchParams.set("sso_ticket", ticket);
                        window.location.href = target.toString();
                        return;

                    } else if (res.status === 401) {
                        // ── Not authenticated: redirect to login ─────────────────
                        console.warn("[CSW SSO] No active session. Redirecting to login.");

                        const loginUrl = new URL("/login", window.location.origin);
                        loginUrl.searchParams.set("redirect", window.location.pathname + window.location.search);
                        const app = searchParams.get("app");
                        if (app) loginUrl.searchParams.set("app", app);
                        const ref = searchParams.get("ref");
                        if (ref) loginUrl.searchParams.set("ref", ref);

                        window.location.href = loginUrl.toString();
                        return;
                    } else {
                        // 5xx / 4xx error from backend — retry if attempts remain
                        if (attempt < MAX_RETRIES) {
                            await new Promise((r) => setTimeout(r, attempt * 300));
                            continue;
                        }

                        console.error("[CSW SSO] Ticket endpoint error, status:", res.status);
                        if (isMounted) {
                            setErrorMessage(`SSO service received error ${res.status} from backend. Please verify Core API is running.`);
                        }
                        return;
                    }
                } catch (error: any) {
                    // Transient network failure (e.g. initial connection, React StrictMode remount, or server lag)
                    console.warn(`[CSW SSO] Handshake attempt ${attempt} failed:`, error?.message);
                    if (attempt < MAX_RETRIES) {
                        await new Promise((r) => setTimeout(r, attempt * 300));
                        continue;
                    }

                    if (isMounted) {
                        console.error("[CSW SSO] Handshake failed after retries:", error);
                        setErrorMessage(error?.message || "Failed to connect to authentication server.");
                    }
                }
            }
        };

        handleSSO();

        return () => {
            isMounted = false;
        };
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
