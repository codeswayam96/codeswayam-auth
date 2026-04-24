"use client";

import { createContext, useContext, ReactNode } from "react";

type AuthMode = "custom";

interface AuthModeContextValue {
    authMode: AuthMode;
    refetch: () => void;
}

const AuthModeContext = createContext<AuthModeContextValue>({
    authMode: "custom",
    refetch: () => {},
});

export function useAuthMode() {
    return useContext(AuthModeContext);
}

export function invalidateAuthModeCache() {
    // No-op
}

export function AuthModeProvider({ children }: { children: ReactNode }) {
    return (
        <AuthModeContext.Provider value={{ authMode: "custom", refetch: () => {} }}>
            {children}
        </AuthModeContext.Provider>
    );
}

