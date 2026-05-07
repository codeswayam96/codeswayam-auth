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

interface DomainConfig {
    domain: string;
    allowSubdomains: boolean;
}

// These domains are always trusted — they don't need a DB entry.
// Wildcards like "localhost" match any localhost:<port> pattern.
const HARDCODED_TRUSTED: DomainConfig[] = [
    { domain: "localhost", allowSubdomains: true },
    { domain: "codeswayam.com", allowSubdomains: true },
    { domain: "vercel.app", allowSubdomains: true }
];

let cachedDomains: DomainConfig[] = [...HARDCODED_TRUSTED];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the list of trusted domains from the Core API.
 * Results are cached for 5 minutes to avoid hammering the API.
 * Always includes localhost and *.codeswayam.com as hardcoded defaults.
 */
export async function getTrustedDomains(): Promise<DomainConfig[]> {
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
            const domains: { domain: string; allowSubdomains?: boolean }[] = await res.json();
            // Extract clean hostnames from the DB (handles 'https://domain.com', 'localhost:3000', or just 'domain.com')
            const dbDomains: DomainConfig[] = domains.map((d) => {
                let parsedDomain = d.domain;
                try {
                    const urlString = d.domain.startsWith("http") ? d.domain : `https://${d.domain}`;
                    parsedDomain = new URL(urlString).hostname;
                } catch {
                    // fallback
                }
                return {
                    domain: parsedDomain,
                    allowSubdomains: d.allowSubdomains ?? true,
                };
            });
            
            // Deduplicate based on domain
            const allDomains = [...HARDCODED_TRUSTED, ...dbDomains];
            const uniqueDomains = Array.from(new Map(allDomains.map(item => [item.domain, item])).values());
            
            cachedDomains = uniqueDomains;
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
            if (hostname === trusted.domain) return true;

            // Case 2: "localhost" in trusted list → allow any localhost:<port>
            if (trusted.domain === "localhost" && hostname === "localhost") return true;

            // Case 3: Subdomain match (only if explicitly allowed for this domain)
            if (trusted.allowSubdomains && hostname.endsWith("." + trusted.domain)) return true;

            return false;
        });
    } catch {
        // Malformed URL
        return false;
    }
}
