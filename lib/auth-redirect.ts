/**
 * Trusted domains that the auth system is allowed to redirect to.
 * Covers all *.codeswayam.com subdomains and localhost for development.
 */
const ALLOWED_DOMAINS = [
  "localhost",
  "codeswayam.com",
];

/**
 * Checks whether a redirect URL is safe to navigate to.
 */
export function isAllowedRedirect(url: string): boolean {
  if (url.startsWith("/")) return true;
  // Block non-http(s) protocols
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

/**
 * Utility to check if user is authenticated.
 * apiUrl MUST be a hardcoded env value — never pass user input here.
 */
export async function checkUserAuth(apiUrl: string): Promise<boolean> {
  // Guard: only allow http/https to prevent SSRF
  if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) return false;
  try {
    const response = await fetch(`${apiUrl}/auth/check`, {
      credentials: "include",
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    return data.authenticated === true;
  } catch {
    return false;
  }
}
