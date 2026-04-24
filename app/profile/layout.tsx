"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Shield, CreditCard, LogOut, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProfile, logout } from "@/lib/api";
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

const ProfileContext = createContext<{
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  loading: boolean;
}>({ user: null, setUser: () => {}, loading: true });

export function useProfile() {
  return useContext(ProfileContext);
}

const navItems = [
  { href: "/profile", icon: User, label: "Account" },
  { href: "/profile/security", icon: Shield, label: "Security" },
  { href: "/profile/subscription", icon: CreditCard, label: "Subscription" },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProfile()
      .then(setUser)
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

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
    <ProfileContext.Provider value={{ user, setUser, loading }}>
      <div className="min-h-screen bg-muted/30">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto flex h-14 items-center px-6">
            <Link href="/" className="flex items-center gap-2 mr-auto">
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

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account, security, and subscription</p>
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
    </ProfileContext.Provider>
  );
}
