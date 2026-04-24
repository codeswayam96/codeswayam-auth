"use client";

import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthModeProvider } from "@/lib/auth-mode";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthModeProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                {children}
            </GoogleOAuthProvider>
        </AuthModeProvider>
    );
}

