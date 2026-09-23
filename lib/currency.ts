"use client";

import { useState, useEffect, useCallback } from "react";

export type Currency = "INR" | "USD";

const CURRENCY_COOKIE_NAME = "csw_currency";

/**
 * Detects the user's currency based on:
 * 1. Explicit query parameter (?currency=usd or ?currency=inr)
 * 2. Shared cookie `csw_currency`
 * 3. Browser timezone (Asia/Kolkata or Asia/Calcutta -> INR, otherwise USD)
 */
export function detectInitialCurrency(): Currency {
    if (typeof window === "undefined") return "INR";

    // 1. Explicit query param
    try {
        const searchParams = new URLSearchParams(window.location.search);
        const queryCurrency = searchParams.get("currency")?.toUpperCase();
        if (queryCurrency === "USD" || queryCurrency === "INR") {
            setCurrencyCookie(queryCurrency as Currency);
            return queryCurrency as Currency;
        }
    } catch {}

    // 2. Persistent cookie
    try {
        const match = document.cookie.match(new RegExp(`(^|;\\s*)${CURRENCY_COOKIE_NAME}=([^;]+)`));
        if (match) {
            const val = decodeURIComponent(match[2]).toUpperCase();
            if (val === "USD" || val === "INR") {
                return val as Currency;
            }
        }
    } catch {}

    // 3. Browser timezone heuristic
    try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const isIndia =
            userTimezone.includes("Calcutta") ||
            userTimezone.includes("Kolkata") ||
            userTimezone.includes("Asia/Colombo") ||
            userTimezone.toLowerCase().includes("india");

        return isIndia ? "INR" : "USD";
    } catch {
        return "USD"; // Default to international USD for safe fallback outside India
    }
}

/**
 * Persists the currency preference into a domain-wide cookie (.codeswayam.com or current host).
 */
export function setCurrencyCookie(currency: Currency): void {
    if (typeof window === "undefined") return;

    try {
        const host = window.location.hostname;
        const isCodeSwayam = host.endsWith("codeswayam.com");
        const domainAttr = isCodeSwayam ? "; domain=.codeswayam.com" : "";
        const maxAge = 60 * 60 * 24 * 365; // 1 year

        document.cookie = `${CURRENCY_COOKIE_NAME}=${currency}; path=/; max-age=${maxAge}; SameSite=Lax${domainAttr}`;
    } catch {}
}

/**
 * React hook providing the active currency and a setter that syncs with cookies.
 */
export function useCurrency(defaultOverride?: Currency) {
    const [currency, setCurrencyState] = useState<Currency>(() => defaultOverride || detectInitialCurrency());
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!defaultOverride) {
            const detected = detectInitialCurrency();
            setCurrencyState(detected);
        }
        setIsLoaded(true);
    }, [defaultOverride]);

    const setCurrency = useCallback((newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        setCurrencyCookie(newCurrency);
    }, []);

    const toggleCurrency = useCallback(() => {
        setCurrencyState((prev) => {
            const next = prev === "INR" ? "USD" : "INR";
            setCurrencyCookie(next);
            return next;
        });
    }, []);

    return {
        currency,
        setCurrency,
        toggleCurrency,
        isLoaded,
    };
}
