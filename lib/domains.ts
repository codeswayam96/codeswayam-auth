/**
 * Domain Management Service
 *
 * Fetches and caches trusted domains from the Core API (populated via admin settings).
 * Used by the auth service to validate SSO redirect targets — preventing open redirects.
 *
 * Built-in domains that are ALWAYS trusted (no DB entry needed):
 *  - localhost (any port) — for local development of any app
 *  - *.codeswayam.com    — all platform subdomains
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// These domains are always trusted — they don't need a DB entry.
// Wildcards like "localhost" match any localhost:<port> pattern.
const HARDCODED_TRUSTED: string[] = ["localhost", "codeswayam.com"];

let cachedDomains: string[] = [...HARDCODED_TRUSTED];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the list of trusted domains from the Core API.
 * Results are cached for 5 minutes to avoid hammering the API.
 * Always includes localhost and *.codeswayam.com as hardcoded defaults.
 */
export async function getTrustedDomains(): Promise<string[]> {
    const now = Date.now();

    // Return cache if still fresh
    if (now - lastFetch < CACHE_TTL && lastFetch > 0) {
        return cachedDomains;
    }

    try {
        const res = await fetch(`${API_URL}/auth/domains`, {
            next: { revalidate: 300 }, // Next.js ISR cache for 5 mins
        });

        if (res.ok) {
            const domains: { domain: string }[] = await res.json();
            // Merge hardcoded + DB domains, deduplicate
            const dbDomains = domains.map((d) => d.domain);
            cachedDomains = [...new Set([...HARDCODED_TRUSTED, ...dbDomains])];
            lastFetch = now;
        }
    } catch (error) {
        console.error("[CSW Auth] Failed to fetch trusted domains:", error);
        // Keep using cached (or hardcoded) values on failure
    }

    return cachedDomains;
}

/**
 * Validates if a redirect URL is safe (i.e. targets a trusted domain).
 *
 * Rules:
 *  1. Relative paths (starting with "/") are always allowed.
 *  2. "localhost" matches ANY port: localhost:3000, localhost:3007, etc.
 *  3. Exact domain matches: "auraflow.com" matches "auraflow.com"
 *  4. Subdomain matches: "codeswayam.com" matches "*.codeswayam.com"
 *  5. Admin can add custom domains (auraflow.com) via the admin panel → trusted_domains table.
 */
export async function isAllowedRedirect(url: string): Promise<boolean> {
    // Relative paths are always safe
    if (url.startsWith("/")) return true;

    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname; // e.g. "localhost" or "auraflow.com"
        const allowedDomains = await getTrustedDomains();

        return allowedDomains.some((trusted) => {
            // Case 1: Exact match (e.g. "auraflow.com" === "auraflow.com")
            if (hostname === trusted) return true;

            // Case 2: "localhost" in trusted list → allow any localhost:<port>
            if (trusted === "localhost" && hostname === "localhost") return true;

            // Case 3: Subdomain match (e.g. trusted="codeswayam.com" → allows "ems.codeswayam.com")
            if (hostname.endsWith("." + trusted)) return true;

            return false;
        });
    } catch {
        // Malformed URL
        return false;
    }
}
