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
 * Allows internal paths (starting with "/") and any URL whose hostname
 * matches or is a subdomain of the entries in ALLOWED_DOMAINS.
 */
export function isAllowedRedirect(url: string): boolean {
  if (url.startsWith("/")) return true;
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
 * Utility to check if user is authenticated
 */
export async function checkUserAuth(apiUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/users/profile`, {
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}
