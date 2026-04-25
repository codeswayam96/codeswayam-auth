"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAllowedRedirect } from "@/lib/domains";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function SSOHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const redirectUrl = searchParams.get("redirect") || searchParams.get("redirect_url");

    useEffect(() => {
        const handleSSO = async () => {
            if (!redirectUrl) {
                router.push("/dashboard");
                return;
            }

            // 1. Verify redirect is allowed
            const allowed = await isAllowedRedirect(redirectUrl);
            if (!allowed) {
                console.error("SSO blocked: Domain not trusted", redirectUrl);
                router.push("/dashboard");
                return;
            }

            try {
                // 2. Check session and get SSO ticket from API
                // We use credentials: "include" to send the Authentication cookie
                const res = await fetch(`${API_URL}/auth/sso/ticket`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}), 
                    credentials: "include",
                });

                if (res.ok) {
                    const { ticket } = await res.json();
                    console.log("SSO Ticket acquired, redirecting...");
                    
                    // 3. Redirect back to client with ticket
                    const target = new URL(redirectUrl);
                    target.searchParams.set("sso_ticket", ticket);
                    window.location.href = target.toString();
                } else {
                    console.warn("SSO Session invalid, redirecting to login");
                    // Not logged in or session expired
                    const loginUrl = new URL("/login", window.location.origin);
                    loginUrl.searchParams.set("redirect", window.location.href);
                    router.push(loginUrl.toString());
                }
            } catch (error) {
                console.error("SSO Handshake failed:", error);
                const loginUrl = new URL("/login", window.location.origin);
                loginUrl.searchParams.set("redirect", window.location.href);
                router.push(loginUrl.toString());
            }
        };

        handleSSO();
    }, [redirectUrl, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <h1 className="text-xl font-semibold">Authorizing...</h1>
                <p className="text-muted-foreground text-sm">Transferring your session safely.</p>
            </div>
        </div>
    );
}

export default function SSOPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SSOHandler />
        </Suspense>
    );
}
