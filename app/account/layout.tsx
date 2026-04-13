"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, CreditCard, Settings, LogOut, Zap, Loader2, Shield, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProfile, logout } from "@/lib/api";
import { useAuthMode } from "@/lib/auth-mode";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  clerkId: string | null;
  googleId: string | null;
  lastActiveAt: string | null;
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

const navItems = [
  { href: "/account", icon: Home, label: "Overview" },
  { href: "/account/profile", icon: User, label: "Profile" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/account/security", icon: Shield, label: "Security" },
  { href: "/account/billing", icon: DollarSign, label: "Billing" },
  { href: "/account/preferences", icon: Settings, label: "Preferences" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authMode } = useAuthMode();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Delay profile fetch in Clerk/Both mode to allow exchange to complete
    const delay = (authMode === "both") ? 1000 : 0;

    const timer = setTimeout(() => {
      fetchProfile()
        .then(setUser)
        .catch(() => {
          router.push("/login");
        })
        .finally(() => setLoading(false));
    }, delay);

    return () => clearTimeout(timer);
  }, [router, authMode]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AccountContext.Provider value={{ user, setUser, loading }}>
      <div className="min-h-screen bg-muted/30">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto flex h-14 items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-2 mr-auto hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap size={14} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">CodeSwayam</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium hidden sm:block">{displayName}</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground mt-1">Manage your profile, subscriptions, and account settings</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar nav */}
            <nav className="w-full md:w-56 shrink-0 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AccountContext.Provider>
  );
}
