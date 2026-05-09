/**
 * Resolves the signup source from URL search params.
 *
 * Priority:
 *  1. `source` param  — explicit platform tag (e.g. "auraflow", "ems")
 *  2. `ref` param     — referral/redirect origin (e.g. "auraflow.codeswayam.com")
 *  3. hostname of `redirect` param — fallback derived from the post-signup destination
 */
export function resolveSignupSource(searchParams: URLSearchParams): string | undefined {
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
