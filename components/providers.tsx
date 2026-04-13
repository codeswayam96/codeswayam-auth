"use client";

import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthModeProvider, useAuthMode } from "@/lib/auth-mode";
import { useClerkExchangeAuth } from "@/lib/use-clerk-exchange";
import { Loader2 } from "lucide-react";

/**
 * Rendered INSIDE ClerkProvider — safely calls useAuth/useUser hooks.
 * Only mounted when authMode === "both", so ClerkProvider is guaranteed to exist.
 */
function ClerkExchangeBridge({ children }: { children: ReactNode }) {
    // This is safe because this component only ever renders inside <ClerkProvider>
    useClerkExchangeAuth();
    return <>{children}</>;
}

/**
 * Switches providers based on auth mode:
 * - "custom"  → Google OAuth only (no Clerk — avoids Clerk overhead + SDK errors)
 * - "both"    → Clerk (for email-verification hooks) + Google OAuth
 *              ClerkExchangeBridge is rendered INSIDE ClerkProvider so useAuth() is safe
 */
function AuthProviderSwitch({ children }: { children: ReactNode }) {
    const { authMode } = useAuthMode();

    // Still loading auth mode from server
    if (authMode === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (authMode === "both") {
        return (
            <ClerkProvider
                publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}
            >
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                    {/* ClerkExchangeBridge is inside ClerkProvider — useAuth() is safe here */}
                    <ClerkExchangeBridge>{children}</ClerkExchangeBridge>
                </GoogleOAuthProvider>
            </ClerkProvider>
        );
    }

    // "custom" mode — Google OAuth only, NO ClerkProvider, NO Clerk hooks
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            {children}
        </GoogleOAuthProvider>
    );
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthModeProvider>
            <AuthProviderSwitch>{children}</AuthProviderSwitch>
        </AuthModeProvider>
    );
}
