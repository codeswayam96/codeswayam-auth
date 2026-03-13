const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function apiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (res.status === 401 || res.status === 403) {
        throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return res.json();
}

export async function fetchProfile() {
    return apiFetch("/users/profile");
}

export async function updateProfile(data: { name?: string }) {
    return apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function changePassword(currentPassword: string, newPassword: string) {
    return apiFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function deleteAccount() {
    return apiFetch("/users/account", {
        method: "DELETE",
    });
}

export async function login(email: string, password: string) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function signup(email: string, password: string, name: string) {
    return apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
    });
}

export async function googleLogin(token: string) {
    return apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ token }),
    });
}

export async function logout() {
    try {
        await apiFetch("/auth/logout", { method: "POST" });
    } catch {
        // Continue even if backend call fails — clear cookie client-side as fallback
    }
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    const domainAttr = cookieDomain ? `; Domain=${cookieDomain}` : "";
    document.cookie = `Authentication=; Path=/${domainAttr}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

/** Returns the current user's profile, or null if not authenticated. */
export async function getSession(): Promise<{ id: string; email: string; name: string } | null> {
    try {
        return await fetchProfile();
    } catch {
        return null;
    }
}
