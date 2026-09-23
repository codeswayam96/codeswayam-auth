import { resolveAppContext } from "./app-context";

/**
 * Resolves the signup source from URL search params.
 *
 * Priority:
 *  1. `app` / `appName` param — explicit originating app (e.g. "auraflow", "admin-panel")
 *  2. `source` param          — explicit platform tag (e.g. "auraflow", "ems")
 *  3. `ref` param             — referral/redirect origin (e.g. "auraflow.codeswayam.com")
 *  4. resolved app from redirect destination
 */
export function resolveSignupSource(searchParams: URLSearchParams): string | undefined {
    const appContext = resolveAppContext(searchParams);
    if (appContext?.slug) return appContext.slug;

    const source = searchParams.get("source");
    if (source) return source;

    const ref = searchParams.get("ref");
    if (ref) return ref;

    const redirect = searchParams.get("redirect") || searchParams.get("redirect_url");
    if (redirect) {
        try {
            return new URL(redirect).hostname;
        } catch {
            // malformed URL — ignore
        }
    }

    return undefined;
}
