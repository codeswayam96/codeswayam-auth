"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchProfile, logout } from "@/lib/api";
import { toast } from "sonner";
import { BrandLoader } from "@/components/brand-loader";
import {
  AccountHeader,
  AccountSidebar,
  MobileNav,
  AccountStatusBanner,
} from "./_components";

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  googleId: string | null;
  lastActiveAt: string | null;
  twoFactorEnabled: boolean;
  rejectionReason?: string | null;
  createdAt: string;
}

const AccountContext = createContext<{
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  loading: boolean;
}>({ user: null, setUser: () => {}, loading: true });

export function useAccount() {
  return useContext(AccountContext);
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile()
        .then((res) => setUser(res?.data ?? res))
        .catch(() => {
          router.push("/login");
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return <BrandLoader fullScreen text="Verifying your credentials..." />;
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AccountContext.Provider value={{ user, setUser, loading }}>
      <div className="min-h-screen bg-muted/30">
        <AccountHeader
          displayName={displayName}
          email={user?.email}
          initials={initials}
          onLogout={handleLogout}
        />

        <AccountStatusBanner
          status={user?.status}
          rejectionReason={user?.rejectionReason}
        />

        <MobileNav pathname={pathname} />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight">My Account</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your profile, subscriptions, and account settings
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <AccountSidebar
              pathname={pathname}
              role={user?.role}
              onLogout={handleLogout}
            />

            <main className="flex-1 overflow-hidden" style={{ minWidth: 0 }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </AccountContext.Provider>
  );
}
