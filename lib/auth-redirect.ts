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
