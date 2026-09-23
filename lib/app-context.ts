/**
 * App Context Resolver
 *
 * Detects originating application context across SSO login, signup, and subscription screens.
 * Ensures the user never loses context of which app they came from and where they will return.
 */

export interface AppMetadata {
    name: string;
    slug: string;
    description?: string;
    returnUrl?: string;
    isPlatformDefault?: boolean;
}

const KNOWN_APPS: Record<string, { name: string; slug: string; description: string; ports: string[]; domains: string[] }> = {
    auraflow: {
        name: "AuraFlow",
        slug: "auraflow",
        description: "AI-Powered Workflow Automation",
        ports: ["3006"],
        domains: ["aura.codeswayam.com", "auraflow.codeswayam.com", "auraflow.com"],
    },
    admin: {
        name: "Admin Panel",
        slug: "admin-panel",
        description: "CodeSwayam Platform Control Center",
        ports: ["3001"],
        domains: ["admin.codeswayam.com"],
    },
    neural: {
        name: "Neural Platform",
        slug: "neural",
        description: "Autonomous Agent & AI Intelligence",
        ports: ["3004"],
        domains: ["neural.codeswayam.com"],
    },
    pdfcraft: {
        name: "PDFCraft",
        slug: "pdfcraft",
        description: "Document Processing & Generation Studio",
        ports: ["3007"],
        domains: ["pdfcraft.codeswayam.com", "pdfcraft.com"],
    },
    pixelforge: {
        name: "PixelForge",
        slug: "pixelforge",
        description: "Visual Asset & Design Engine",
        ports: ["3008"],
        domains: ["pixelforge.codeswayam.com", "pixelforge.com"],
    },
    ems: {
        name: "EMS Platform",
        slug: "ems",
        description: "Enterprise Management System",
        ports: ["3005"],
        domains: ["ems.codeswayam.com"],
    },
};

/**
 * Extracts and normalizes the originating app metadata from search parameters.
 */
export function getDefaultAppUrl(app: { ports: string[]; domains: string[] }): string {
    const isProd = process.env.NODE_ENV === "production" || (typeof window !== "undefined" && !window.location.hostname.includes("localhost"));
    if (isProd && app.domains.length > 0) {
        return `https://${app.domains[0]}`;
    }
    if (app.ports.length > 0) {
        return `http://localhost:${app.ports[0]}`;
    }
    return "/";
}

export function resolveAppContext(searchParams: URLSearchParams | null): AppMetadata | null {
    if (!searchParams) return null;

    const rawApp = searchParams.get("app") || searchParams.get("appName") || searchParams.get("source");
    const rawRedirect = searchParams.get("redirect") || searchParams.get("redirect_url") || searchParams.get("returnUrl");
    const rawRef = searchParams.get("ref");

    // 1. Direct app match if passed explicitly
    if (rawApp) {
        const clean = rawApp.toLowerCase().trim();
        for (const [key, app] of Object.entries(KNOWN_APPS)) {
            if (clean === key || clean === app.slug || clean === app.name.toLowerCase()) {
                return {
                    name: app.name,
                    slug: app.slug,
                    description: app.description,
                    returnUrl: resolveDirectReturn(rawRedirect) || getDefaultAppUrl(app),
                };
            }
        }
        // Custom app name passed
        return {
            name: rawApp,
            slug: clean.replace(/[^a-z0-9_-]/g, ""),
            returnUrl: resolveDirectReturn(rawRedirect),
        };
    }

    // 2. Infer from redirect URL or ref
    const candidateUrl = rawRedirect || rawRef;
    if (candidateUrl) {
        try {
            // If redirect is an SSO path like /sso?redirect=http... parse the nested redirect
            let target = candidateUrl;
            if (target.startsWith("/sso") && target.includes("redirect=")) {
                const nestedParams = new URL(target, "http://localhost").searchParams;
                target = nestedParams.get("redirect") || target;
            }

            const parsed = new URL(target.startsWith("http") ? target : `http://${target}`);
            const host = parsed.hostname;
            const port = parsed.port;

            for (const app of Object.values(KNOWN_APPS)) {
                if (
                    app.ports.includes(port) ||
                    app.domains.some((d) => host === d || host.endsWith("." + d)) ||
                    host.includes(app.slug) ||
                    host.includes(app.name.toLowerCase())
                ) {
                    return {
                        name: app.name,
                        slug: app.slug,
                        description: app.description,
                        returnUrl: resolveDirectReturn(target) || getDefaultAppUrl(app),
                    };
                }
            }
        } catch {
            // URL parse error — fallback
        }
    }

    return null;
}

function resolveDirectReturn(url?: string | null): string | undefined {
    if (!url) return undefined;
    try {
        if (url.startsWith("/sso") && url.includes("redirect=")) {
            const nested = new URL(url, "http://localhost").searchParams.get("redirect");
            if (nested) return resolveDirectReturn(nested);
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
            const u = new URL(url);
            // If callback, point to destination root or original redirect
            if (u.pathname.includes("/auth/callback")) {
                const deep = u.searchParams.get("redirect");
                if (deep && deep.startsWith("/")) {
                    return `${u.origin}${deep}`;
                }
                return u.origin;
            }
            return u.toString();
        }
    } catch {}
    return undefined;
}

const CSW_APP_CONTEXT_KEY = "csw_active_app_context";

/**
 * Resolves app context on client side with session persistence and document.referrer fallback.
 */
export function resolveClientAppContext(searchParams: URLSearchParams | null): AppMetadata | null {
    // 1. Direct searchParams resolution
    const direct = resolveAppContext(searchParams);
    if (direct) {
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(CSW_APP_CONTEXT_KEY, JSON.stringify(direct));
            } catch {}
        }
        return direct;
    }

    if (typeof window === "undefined") return null;

    // 2. SessionStorage cache
    try {
        const cached = sessionStorage.getItem(CSW_APP_CONTEXT_KEY);
        if (cached) {
            const parsed = JSON.parse(cached) as AppMetadata;
            if (parsed && parsed.name && parsed.returnUrl) {
                return parsed;
            }
        }
    } catch {}

    // 3. Fallback to document.referrer
    try {
        const referrer = document.referrer;
        if (referrer && (referrer.startsWith("http://") || referrer.startsWith("https://"))) {
            const refUrl = new URL(referrer);
            const host = refUrl.hostname;
            const port = refUrl.port;

            // Exclude self (auth portal)
            if (port !== "3003" && !host.includes("auth.codeswayam.com")) {
                for (const app of Object.values(KNOWN_APPS)) {
                    if (
                        app.ports.includes(port) ||
                        app.domains.some((d) => host === d || host.endsWith("." + d)) ||
                        host.includes(app.slug) ||
                        host.includes(app.name.toLowerCase())
                    ) {
                        const inferred: AppMetadata = {
                            name: app.name,
                            slug: app.slug,
                            description: app.description,
                            returnUrl: referrer,
                        };
                        try {
                            sessionStorage.setItem(CSW_APP_CONTEXT_KEY, JSON.stringify(inferred));
                        } catch {}
                        return inferred;
                    }
                }
            }
        }
    } catch {}

    return null;
}

