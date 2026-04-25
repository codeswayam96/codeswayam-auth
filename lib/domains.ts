/**
 * Domain Management Service
 * Fetches and caches trusted domains from the Core API.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

let cachedDomains: string[] = ["localhost", "codeswayam.com"];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the list of trusted domains from the Core API.
 * This can be called from server components or middleware.
 */
export async function getTrustedDomains(): Promise<string[]> {
    const now = Date.now();
    
    // Return cache if it's still fresh
    if (now - lastFetch < CACHE_TTL && cachedDomains.length > 2) {
        return cachedDomains;
    }

    try {
        // We use a public endpoint that returns the list of allowed domains
        const res = await fetch(`${API_URL}/auth/domains`, {
            next: { revalidate: 300 } // Cache for 5 mins in Next.js
        });
        
        if (res.ok) {
            const domains = await res.json();
            cachedDomains = ["localhost", "codeswayam.com", ...domains.map((d: any) => d.domain)];
            lastFetch = now;
        }
    } catch (error) {
        console.error("Failed to fetch trusted domains:", error);
    }

    return cachedDomains;
}

/**
 * Validates if a URL is allowed for redirection.
 */
export async function isAllowedRedirect(url: string): Promise<boolean> {
    if (url.startsWith("/")) return true;
    
    try {
        const parsed = new URL(url);
        const allowedDomains = await getTrustedDomains();
        
        return allowedDomains.some(
            (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
        );
    } catch {
        return false;
    }
}
