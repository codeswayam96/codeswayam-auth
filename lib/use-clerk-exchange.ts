"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useAuthMode } from "./auth-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * INTERNAL — only call this from ClerkExchangeBridge inside providers.tsx
 * (which is always rendered inside <ClerkProvider>).
 *
 * Flow (both mode, after the user clicks the Clerk verification email link):
 *  1. User lands on our app (/login) with ?__clerk_ticket=...
 *  2. This hook detects the ticket and calls signUp.create({ strategy: "ticket" })
 *  3. Clerk verifies the ticket + creates the session in the background
 *  4. We call setActive() to log them into Clerk
 *  5. This hook re-runs (now isSignedIn = true) and calls /auth/clerk-exchange
 *  6. Backend verifies email via Clerk → finds user in DB → issues JWT
 *  7. We redirect to /account (or original intended URL)
 */
export function useClerkExchangeAuth() {
    const { isLoaded, userId, isSignedIn } = useAuth();
    const { user } = useUser();
    const clerk = useClerk();
    const { authMode } = useAuthMode();
    const exchangedForRef = useRef<string | null>(null);
    const [isProcessingTicket, setIsProcessingTicket] = useState(false);

    useEffect(() => {
        // Only fires in "both" mode — no Clerk session in custom mode
        if (authMode !== "both") return;

        // 1. Process Clerk email verification ticket if present in URL
        // We use window.location directly to avoid Next.js router suspense issues
        if (isLoaded && !isSignedIn && !isProcessingTicket) {
            const urlParams = new URLSearchParams(window.location.search);
            const ticket = urlParams.get("__clerk_ticket");

            if (ticket && clerk?.client?.signUp) {
                console.log("[ClerkExchange] Processing invitation ticket...");
                setIsProcessingTicket(true);
                // Type assertion because exact 'ticket' strategy might not be fully typed in all v7 versions
                (clerk.client.signUp.create as any)({ strategy: "ticket", ticket })
                    .then((res: any) => {
                        if (res.status === "complete") {
                            console.log("[ClerkExchange] Ticket valid, activating session...");
                            return clerk.setActive({ session: res.createdSessionId });
                        } else {
                            console.warn(
                                "[ClerkExchange] Ticket processed but status is incomplete:",
                                res.status
                            );
                        }
                    })
                    .then(() => {
                        // Clean up the URL so we don't process it again and the URL looks clean
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete("__clerk_ticket");
                        newUrl.searchParams.delete("__clerk_status");
                        window.history.replaceState({}, document.title, newUrl.toString());
                    })
                    .catch((err: any) => {
                        console.error("[ClerkExchange] Failed to process ticket:", err);
                    })
                    .finally(() => {
                        setIsProcessingTicket(false);
                    });
                return; // Wait for the session to become active
            }
        }

        // 2. Perform exchange if signed in and ticket is processed
        if (!isSignedIn || !userId || !user?.primaryEmailAddress?.emailAddress) return;
        // Don't exchange twice for the same Clerk session
        if (exchangedForRef.current === userId) return;

        const email = user.primaryEmailAddress.emailAddress;
        const name =
            [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;

        exchangedForRef.current = userId;

        fetch(`${API_URL}/auth/clerk-exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clerkUserId: userId, email, name }),
            credentials: "include",
        })
            .then(async (res) => {
                if (res.ok) {
                    // Exchange succeeded — JWT cookie is now set.
                    // Redirect to /account (or the intended URL from query params)
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get("redirect") || "/account";
                    // Only redirect to relative URLs for safety
                    const safeRedirect = redirect.startsWith("/") ? redirect : "/account";
                    window.location.href = safeRedirect;
                } else {
                    const data = await res.json().catch(() => ({}));
                    console.warn("[ClerkExchange] Exchange failed:", data.message);
                    // Reset so it can be retried
                    exchangedForRef.current = null;
                }
            })
            .catch((err) => {
                console.error("[ClerkExchange] Network error:", err);
                exchangedForRef.current = null;
            });
    }, [authMode, isSignedIn, userId, user, isLoaded, clerk, isProcessingTicket]);
}
