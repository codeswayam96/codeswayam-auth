"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AuthMode = "custom" | "both";

interface AuthModeContextValue {
    authMode: AuthMode | null; // null = still loading
    refetch: () => void;
}

const AuthModeContext = createContext<AuthModeContextValue>({
    authMode: null,
    refetch: () => {},
});

export function useAuthMode() {
    return useContext(AuthModeContext);
}

// Module-level cache
let cachedMode: AuthMode | null = null;
// Short TTL: 60 seconds — admin changes take effect quickly
let cacheExpiresAt = 0;

/** Clear the cached auth mode (e.g., after admin changes the setting). */
export function invalidateAuthModeCache() {
    cachedMode = null;
    cacheExpiresAt = 0;
}

async function fetchAuthMode(): Promise<AuthMode> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    try {
        const res = await fetch(`${apiUrl}/auth/settings`, {
            credentials: "include",
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch auth settings");
        const data = await res.json();
        // authType from server is "both" | "custom" | "clerk"
        // We treat everything that is NOT "custom" as "both" (Clerk-assisted mode)
        return data?.authType === "both" ? "both" : "custom";
    } catch {
        // Preserve stale cache on error rather than defaulting to wrong mode
        return cachedMode ?? "custom";
    }
}

export function AuthModeProvider({ children }: { children: ReactNode }) {
    const [authMode, setAuthMode] = useState<AuthMode | null>(
        // Use cached value if available and not expired
        cachedMode && Date.now() < cacheExpiresAt ? cachedMode : null
    );

    const loadMode = async (force = false) => {
        const now = Date.now();
        if (!force && cachedMode && now < cacheExpiresAt) {
            setAuthMode(cachedMode);
            return;
        }

        const mode = await fetchAuthMode();
        cachedMode = mode;
        cacheExpiresAt = now + 60 * 1000; // 60-second TTL
        setAuthMode(mode);
    };

    useEffect(() => {
        // Initial load
        loadMode();

        // Re-fetch when user returns to the tab (catches admin-panel mode changes)
        const handleFocus = () => {
            // Invalidate cache on focus so mode switches take effect immediately
            invalidateAuthModeCache();
            loadMode(true);
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthModeContext.Provider value={{ authMode, refetch: () => loadMode(true) }}>
            {children}
        </AuthModeContext.Provider>
    );
}
